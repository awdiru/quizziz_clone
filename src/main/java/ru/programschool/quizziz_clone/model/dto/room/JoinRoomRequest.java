package ru.programschool.quizziz_clone.model.dto.room;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class JoinRoomRequest {
    @NotBlank
    @Size(min = 5, max = 5)
    private String pin;

    @NotBlank
    @Size(min = 2, max = 20)
    private String name;
}