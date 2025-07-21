package com.ChatApp.service;

import org.springframework.http.ResponseEntity;

public interface Command<I, O> {
    O execute(I input);
}
