package ru.programschool.quizziz_clone.model.dto.room;

import lombok.Data;
import java.util.List;

@Data
public class AnswerSubmissionDto {
    private String pin;
    private String playerName;
    private List<Integer> selectedAnswerNumbers;
}