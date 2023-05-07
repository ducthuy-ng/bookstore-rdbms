package com.example.bookstoredbms.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode
public class BookDto {
    private final String isbn;
    private final String name;
    private final Integer publishedYear;
    private final String coverUrl;
}
