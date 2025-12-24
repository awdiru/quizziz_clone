package ru.programschool.quizziz_clone.controller.list;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import ru.programschool.quizziz_clone.model.dto.room.AnswerSubmissionDto;
import ru.programschool.quizziz_clone.service.RoomService;

@Controller
@RequiredArgsConstructor
public class MessageController {
    private final RoomService roomService;

    @MessageMapping("/room/submit")
    public void receiveAnswer(AnswerSubmissionDto submission) {
        roomService.submitAnswer(submission);
    }
}