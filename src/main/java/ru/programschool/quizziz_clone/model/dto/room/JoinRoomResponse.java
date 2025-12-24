package ru.programschool.quizziz_clone.model.dto.room;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JoinRoomResponse {
    private String pin;
    private String playerName;
    private String message;
}