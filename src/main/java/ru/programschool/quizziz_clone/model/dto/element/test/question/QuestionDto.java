package ru.programschool.quizziz_clone.model.dto.element.test.question;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.programschool.quizziz_clone.model.dto.element.test.answer.AnswerDto;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDto {
    private String questionText;
    private List<AnswerDto> answers;
}
