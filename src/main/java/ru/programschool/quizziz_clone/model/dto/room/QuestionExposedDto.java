package ru.programschool.quizziz_clone.model.dto.room;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@Builder
public class QuestionExposedDto {
    private String questionText;
    private int currentQuestionNumber;
    private int totalQuestions;
    private List<? extends AnswerExposedDto> answers;
    private List<StudentsAnswers> studentsAnswers;

    @Data
    @SuperBuilder
    public static class AnswerExposedDto {
        protected String answerText;
        protected int number;
    }

    @EqualsAndHashCode(callSuper = true)
    @Data
    @SuperBuilder
    public static class AnswerClosedDto extends AnswerExposedDto {
        @JsonProperty("isRight")
        private boolean isRight;
    }
}