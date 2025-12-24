package ru.programschool.quizziz_clone.model.dto.element.test;

import lombok.Data;
import ru.programschool.quizziz_clone.model.dto.element.test.question.QuestionDto;

import java.util.List;

@Data
public class TestQuestionsRequest {
    private List<QuestionDto> questions;
}
