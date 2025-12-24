package ru.programschool.quizziz_clone.exception.list;

public class AccessDeniedException extends RuntimeException {
    public AccessDeniedException(String message) {
        super(message);
    }
}
