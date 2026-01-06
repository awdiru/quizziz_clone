package ru.programschool.quizziz_clone.model.dto.room;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class StudentsAnswers {
    private String username;
    private List<Integer> answers;
}
