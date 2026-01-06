package ru.programschool.quizziz_clone.model.entity.redis;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.index.Indexed;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@RedisHash(value = "Room", timeToLive = 86400)
public class Room implements Serializable {
    @Id
    private String id;

    @Indexed
    private Long testId;

    private Long ownerId;

    private RoomStatus status;

    private long currentQuestionStartTime;

    private int currentQuestionIndex;

    @Builder.Default
    private List<Participant> participants = new ArrayList<>();

    public enum RoomStatus {
        WAITING, IN_PROGRESS, FINISHED
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Participant implements Serializable {
        private String name;
        private int score;
        private boolean answered;
        private Long lastAnswerTimestamp;
        private List<Integer> lastAnswers;
    }
}