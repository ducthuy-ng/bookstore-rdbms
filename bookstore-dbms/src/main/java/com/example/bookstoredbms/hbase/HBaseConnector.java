package com.example.bookstoredbms.hbase;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.hbase.CompareOperator;
import org.apache.hadoop.hbase.HBaseConfiguration;
import org.apache.hadoop.hbase.TableName;
import org.apache.hadoop.hbase.client.Admin;
import org.apache.hadoop.hbase.client.Connection;
import org.apache.hadoop.hbase.client.ConnectionFactory;
import org.apache.hadoop.hbase.client.Scan;
import org.apache.hadoop.hbase.client.Table;
import org.apache.hadoop.hbase.filter.BinaryComparator;
import org.apache.hadoop.hbase.filter.FilterList;
import org.apache.hadoop.hbase.filter.FirstKeyOnlyFilter;
import org.apache.hadoop.hbase.filter.SingleColumnValueFilter;
import org.apache.hadoop.hbase.util.Bytes;

import com.example.bookstoredbms.dto.BookCountInYear;
import com.example.bookstoredbms.dto.BookDto;

public class HBaseConnector {
    private Configuration hbaseConf;
    private Table bookTable;
    private Admin hbaseAdminInstance;

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

    // public BookDto getBook() throws IOException {
    // var bookKey = "9782271852030@@@Spares";

    // var getAction = new Get(Bytes.toBytes(bookKey));
    // var result = bookTable.get(getAction);

    // System.out.println(result.toString());
    // return null;
    // }

    public List<BookCountInYear> countBookOfYear() throws IOException {
        var scanAction = new Scan();
        scanAction.addColumn(Bytes.toBytes("info"), Bytes.toBytes("publishedYear"));
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

    public List<BookDto> searchBookInPriceRange(Integer lowerBound, Integer upperBound, Integer offset, Integer limit)
            throws IOException {
        var scanAction = new Scan();
        scanAction.addColumn(Bytes.toBytes("info"), Bytes.toBytes("basic"));
        scanAction.setLimit(offset + limit);

        var upperPaddedPrice = convertToStringWithPadding(upperBound);
        var lowerPaddedPrice = convertToStringWithPadding(lowerBound);

        var upperBoundFilter = new SingleColumnValueFilter(
                Bytes.toBytes("info"),
                Bytes.toBytes("price"),
                CompareOperator.LESS_OR_EQUAL,
                new BinaryComparator(Bytes.toBytes(upperPaddedPrice)));

        var lowerBoundFilter = new SingleColumnValueFilter(
                Bytes.toBytes("info"),
                Bytes.toBytes("price"),
                CompareOperator.GREATER_OR_EQUAL,
                new BinaryComparator(Bytes.toBytes(lowerPaddedPrice)));

        scanAction.setFilter(new FilterList(lowerBoundFilter, upperBoundFilter));

        var searchedBook = new ArrayList<BookDto>(limit);
        var resultScanner = bookTable.getScanner(scanAction);

        resultScanner.next(offset);

        while (true) {
            var result = resultScanner.next();
            if (result == null)
                break;

            var rawInfoBasic = Bytes.toString(result.getValue(Bytes.toBytes("info"), Bytes.toBytes("basic")));
            var splittedBasicInfo = rawInfoBasic.split("@@@");

            searchedBook.add(
                    new BookDto(
                            splittedBasicInfo[0],
                            splittedBasicInfo[1],
                            Integer.parseInt(splittedBasicInfo[2]),
                            splittedBasicInfo[3]));
        }

        resultScanner.close();
        return searchedBook;
    }
}
