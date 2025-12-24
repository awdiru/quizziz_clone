package ru.programschool.quizziz_clone.model.dto.room;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class QuestionExposedDto {
    private String questionText;
    private int currentQuestionNumber;
    private int totalQuestions;
    private List<AnswerExposedDto> answers;

    @Data
    @Builder
    public static class AnswerExposedDto {
        private String answerText;
        private int number;
    }
}