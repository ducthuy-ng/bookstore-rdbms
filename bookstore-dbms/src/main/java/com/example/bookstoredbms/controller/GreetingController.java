package com.example.bookstoredbms.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.bookstoredbms.dto.Book;
import com.example.bookstoredbms.dto.BookBrief;
import com.example.bookstoredbms.dto.BookCountInYear;
import com.example.bookstoredbms.hbase.HBaseConnector;

@RestController
public class GreetingController {
    @Autowired
    private HBaseConnector hBaseConnector;

    @GetMapping("/books/{isbn}")
    public Book getBookByIsbn(@PathVariable String isbn) throws IOException {
        return hBaseConnector.searchByIsbn(isbn);
    }

    @PostMapping("/books")
    @ResponseStatus(HttpStatus.CREATED)
    public void addBook(@RequestBody Book newBook) throws IOException {
        hBaseConnector.addBook(newBook);
    }

    @DeleteMapping("/books/{isbn}")
    public void deleteBookByIsbn(@PathVariable String isbn) throws IOException {
        hBaseConnector.deleteBookByIsbn(isbn);
    }

    @GetMapping("/books")
    public List<BookBrief> search(
            @RequestParam(name = "queryBookName", defaultValue = "", required = false) String name,
            @RequestParam(name = "offset", defaultValue = "0", required = false) Integer offset,
            @RequestParam(name = "limit", defaultValue = "10", required = false) Integer limit) throws IOException {
        return hBaseConnector.searchBook(name, limit, offset);
    }

    @GetMapping("/tables")
    public List<String> getTableNames() throws IOException {
        return hBaseConnector.getAllTableNames();
    }

    @GetMapping("/years")
    public List<BookCountInYear> getYears() throws IOException {
        return hBaseConnector.countBookOfYear();
    }

    @GetMapping("/search-price")
    public List<BookBrief> searchBookInPriceRange(
            @RequestParam(name = "upper", defaultValue = "1000000", required = false) Integer upperBound,
            @RequestParam(name = "lower", defaultValue = "0", required = false) Integer lowerBound,
            @RequestParam(name = "offset", defaultValue = "0", required = false) Integer offset,
            @RequestParam(name = "limit", defaultValue = "10", required = false) Integer limit)
            throws IOException {

        return hBaseConnector.searchBookInPriceRange(lowerBound, upperBound, offset, limit);
    }

    @ExceptionHandler(IOException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public IOException handleHBaseIOException(IOException exception) {
        return exception;
    }
}