package com.example.bookstoredbms.dto;

import lombok.Data;

@Data
public class Book {
    private final String isbn;
    private final String name;
    private final String author;
    private final Integer numOfPage;
    private final Integer publishedYear;
    private final String coverUrl;
    private final Integer sellPrice;
}
