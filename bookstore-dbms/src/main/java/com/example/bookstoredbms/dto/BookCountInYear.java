package com.example.bookstoredbms.dto;

import lombok.Data;

@Data
public class BookCountInYear {
    private final Integer year;
    private final Integer bookNum;
}
