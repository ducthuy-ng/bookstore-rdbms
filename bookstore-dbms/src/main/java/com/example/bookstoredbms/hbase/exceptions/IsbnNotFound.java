package com.example.bookstoredbms.hbase.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class IsbnNotFound extends RuntimeException {
    public IsbnNotFound(String isbn) {
        super(String.format("ISBN not found %s", isbn));
    }
}
