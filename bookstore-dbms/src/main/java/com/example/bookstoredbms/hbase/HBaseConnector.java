package com.example.bookstoredbms.hbase;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.apache.commons.math3.analysis.function.Add;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.hbase.CompareOperator;
import org.apache.hadoop.hbase.HBaseConfiguration;
import org.apache.hadoop.hbase.TableName;
import org.apache.hadoop.hbase.client.Admin;
import org.apache.hadoop.hbase.client.Connection;
import org.apache.hadoop.hbase.client.ConnectionFactory;
import org.apache.hadoop.hbase.client.Delete;
import org.apache.hadoop.hbase.client.Get;
import org.apache.hadoop.hbase.client.Put;
import org.apache.hadoop.hbase.client.Result;
import org.apache.hadoop.hbase.client.Scan;
import org.apache.hadoop.hbase.client.Table;
import org.apache.hadoop.hbase.filter.BinaryComparator;
import org.apache.hadoop.hbase.filter.FilterList;
import org.apache.hadoop.hbase.filter.FirstKeyOnlyFilter;
import org.apache.hadoop.hbase.filter.RowFilter;
import org.apache.hadoop.hbase.filter.SingleColumnValueFilter;
import org.apache.hadoop.hbase.filter.SubstringComparator;
import org.apache.hadoop.hbase.filter.FilterList.Operator;
import org.apache.hadoop.hbase.util.Bytes;

import com.example.bookstoredbms.dto.BookCountInYear;
import com.example.bookstoredbms.hbase.exceptions.IsbnNotFound;
import com.example.bookstoredbms.dto.Book;
import com.example.bookstoredbms.dto.BookBrief;

public class HBaseConnector {
    private Configuration hbaseConf;
    private Table bookTable;
    private Admin hbaseAdminInstance;

    private static byte[] COLUMN_FAMILY = Bytes.toBytes("info");

    public HBaseConnector() throws IOException {
        readHbaseConnectConfiguration();
        Connection hbaseConn = ConnectionFactory.createConnection(hbaseConf);

        bookTable = hbaseConn.getTable(TableName.valueOf("book"));
        hbaseAdminInstance = hbaseConn.getAdmin();
    }

    private void readHbaseConnectConfiguration() {
        String clientConfPath = this.getClass().getClassLoader().getResource("hbase-site.client.xml").getPath();
        hbaseConf = HBaseConfiguration.create();
        hbaseConf.addResource(new Path(clientConfPath));
    }

    public List<String> getAllTableNames() throws IOException {
        var rawTableNames = hbaseAdminInstance.listTableNames();
        var parsedTableNames = new ArrayList<String>(rawTableNames.length);

        for (var tableNames : rawTableNames) {
            parsedTableNames.add(tableNames.toString());
        }
        return parsedTableNames;
    }

    public Book searchByIsbn(String isbn) throws IOException {
        var getAction = new Get(Bytes.toBytes(isbn));
        getAction.addFamily(COLUMN_FAMILY);

        var result = bookTable.get(getAction);

        if (result.isEmpty())
            throw new IsbnNotFound(isbn);

        return getBookFromResult(result);
    }

    public void addBook(Book book) throws IOException {
        var rowKey = Bytes.toBytes(book.getIsbn());

        var bookName = Bytes.toBytes(book.getName());
        var pageNumString = Bytes.toBytes(String.valueOf(book.getNumOfPage()));
        var authors = Bytes.toBytes(book.getAuthor());
        var publishedYear = Bytes.toBytes(String.valueOf(book.getPublishedYear()));
        var coverUrl = Bytes.toBytes(book.getCoverUrl());

        var paddedPrice = convertToStringWithPadding(book.getSellPrice());
        var price = Bytes.toBytes(String.valueOf(paddedPrice));

        var putAction = new Put(rowKey);
        putAction.addColumn(COLUMN_FAMILY, Bytes.toBytes("name"), bookName);
        putAction.addColumn(COLUMN_FAMILY, Bytes.toBytes("pageNum"), pageNumString);
        putAction.addColumn(COLUMN_FAMILY, Bytes.toBytes("authors"), authors);
        putAction.addColumn(COLUMN_FAMILY, Bytes.toBytes("publishedYear"), publishedYear);
        putAction.addColumn(COLUMN_FAMILY, Bytes.toBytes("coverUrl"), coverUrl);
        putAction.addColumn(COLUMN_FAMILY, Bytes.toBytes("price"), price);

        bookTable.put(putAction);
    }

    public void deleteBookByIsbn(String isbn) throws IOException {
        var rowKey = Bytes.toBytes(isbn);
        var deleteAction = new Delete(rowKey);
        bookTable.delete(deleteAction);
    }

    public List<BookBrief> searchBook(String queryNameOrIsbn, Integer limit, Integer offset) throws IOException {
        var scanAction = new Scan();
        scanAction.addFamily(COLUMN_FAMILY);
        scanAction.setLimit(offset + limit);

        var isbnFilter = new RowFilter(
                CompareOperator.EQUAL,
                new SubstringComparator(queryNameOrIsbn));

        var nameFilter = new SingleColumnValueFilter(
                COLUMN_FAMILY,
                Bytes.toBytes("name"),
                CompareOperator.EQUAL,
                new SubstringComparator(queryNameOrIsbn));

        scanAction.setFilter(new FilterList(FilterList.Operator.MUST_PASS_ONE, isbnFilter, nameFilter));

        var searchedBook = new ArrayList<BookBrief>(limit);
        var resultScanner = bookTable.getScanner(scanAction);

        resultScanner.next(offset);

        while (true) {
            var result = resultScanner.next();
            if (result == null)
                break;

            searchedBook.add(getBookBriefFromResult(result));
        }

        resultScanner.close();
        return searchedBook;
    }

    public List<BookCountInYear> countBookOfYear() throws IOException {
        var scanAction = new Scan();
        scanAction.addColumn(COLUMN_FAMILY, Bytes.toBytes("publishedYear"));
        scanAction.setFilter(new FirstKeyOnlyFilter());

        var yearCounter = new HashMap<Integer, Integer>();
        var resultScanner = bookTable.getScanner(scanAction);

        for (var result : resultScanner) {
            var bookYear = Integer.parseInt(
                    Bytes.toString(result.getValue("info".getBytes(), "publishedYear".getBytes())));

            var incrementedCounter = yearCounter.getOrDefault(bookYear, 0) + 1;
            yearCounter.put(bookYear, incrementedCounter);
        }

        resultScanner.close();
        return convertYearCountMap(yearCounter);
    }

    private List<BookCountInYear> convertYearCountMap(HashMap<Integer, Integer> yearCounter) {
        var resultedList = new ArrayList<BookCountInYear>(yearCounter.size());

        yearCounter.forEach((year, bookCount) -> {
            resultedList.add(new BookCountInYear(year, bookCount));
        });
        return resultedList;
    }

    public static Integer PRICE_STRING_LENGTH = 10;

    private String convertToStringWithPadding(Integer price) {
        return String.format("%1$" + PRICE_STRING_LENGTH + "s", price.toString()).replace(' ', '0');

    }

    public List<BookBrief> searchBookInPriceRange(Integer lowerBound, Integer upperBound, Integer offset, Integer limit)
            throws IOException {
        var scanAction = new Scan();
        scanAction.setLimit(offset + limit);

        var upperPaddedPrice = convertToStringWithPadding(upperBound);
        var lowerPaddedPrice = convertToStringWithPadding(lowerBound);

        var upperBoundFilter = new SingleColumnValueFilter(
                COLUMN_FAMILY,
                Bytes.toBytes("price"),
                CompareOperator.LESS_OR_EQUAL,
                new BinaryComparator(Bytes.toBytes(upperPaddedPrice)));

        var lowerBoundFilter = new SingleColumnValueFilter(
                COLUMN_FAMILY,
                Bytes.toBytes("price"),
                CompareOperator.GREATER_OR_EQUAL,
                new BinaryComparator(Bytes.toBytes(lowerPaddedPrice)));

        scanAction.setFilter(new FilterList(lowerBoundFilter, upperBoundFilter));

        var searchedBook = new ArrayList<BookBrief>(limit);
        var resultScanner = bookTable.getScanner(scanAction);

        resultScanner.next(offset);

        while (true) {
            var result = resultScanner.next();
            if (result == null)
                break;

            searchedBook.add(getBookBriefFromResult(result));
        }

        resultScanner.close();
        return searchedBook;
    }

    private BookBrief getBookBriefFromResult(Result result) {
        var isbn = Bytes.toString(result.getRow());
        var bookName = Bytes.toString(result.getValue(COLUMN_FAMILY, Bytes.toBytes("name")));
        var publishedYear = convertHbaseBytesToInt(
                result.getValue(COLUMN_FAMILY, Bytes.toBytes("publishedYear")));
        var coverUrl = Bytes.toString(result.getValue(COLUMN_FAMILY, Bytes.toBytes("coverUrl")));

        return new BookBrief(isbn, bookName, publishedYear, coverUrl);
    }

    private Book getBookFromResult(Result result) {
        var isbn = Bytes.toString(result.getRow());
        var bookName = Bytes.toString(result.getValue(COLUMN_FAMILY, Bytes.toBytes("name")));
        var pageNum = convertHbaseBytesToInt(result.getValue(COLUMN_FAMILY, Bytes.toBytes("pageNum")));
        var authors = Bytes.toString(result.getValue(COLUMN_FAMILY, Bytes.toBytes("authors")));
        var publishedYear = convertHbaseBytesToInt(
                result.getValue(COLUMN_FAMILY, Bytes.toBytes("publishedYear")));
        var coverUrl = Bytes.toString(result.getValue(COLUMN_FAMILY, Bytes.toBytes("coverUrl")));
        var price = convertHbaseBytesToInt(result.getValue(COLUMN_FAMILY, Bytes.toBytes("price")));

        return new Book(isbn, bookName, authors, pageNum, publishedYear, coverUrl, price);
    }

    private static Integer convertHbaseBytesToInt(byte[] input) {
        return Integer.valueOf(Bytes.toString(input));
    }
}
