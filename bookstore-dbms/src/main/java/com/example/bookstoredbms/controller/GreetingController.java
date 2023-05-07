package com.example.bookstoredbms.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.bookstoredbms.dto.BookCountInYear;
import com.example.bookstoredbms.dto.BookDto;
import com.example.bookstoredbms.hbase.HBaseConnector;

@RestController
public class GreetingController {
    @Autowired
    private HBaseConnector hBaseConnector;

    @GetMapping("/search")
    public List<BookDto> search(
            @RequestParam(name = "queryBookName", defaultValue = "", required = false) String name,
            @RequestParam(name = "offset", defaultValue = "0", required = false) Integer offset,
            @RequestParam(name = "limit", defaultValue = "10", required = false) Integer limit) {

        var searchedBooks = new ArrayList<BookDto>();
        searchedBooks.add(new BookDto("1234", "Test", 2023, "http://google.com"));
        return searchedBooks;
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
    public List<BookDto> searchBookInPriceRange(
            @RequestParam(name = "upper", defaultValue = "1000000", required = false) Integer upperBound,
            @RequestParam(name = "lower", defaultValue = "0", required = false) Integer lowerBound,
            @RequestParam(name = "offset", defaultValue = "0", required = false) Integer offset,
            @RequestParam(name = "limit", defaultValue = "10", required = false) Integer limit)
            throws IOException {

        return hBaseConnector.searchBookInPriceRange(lowerBound, upperBound, offset, limit);
    }
}