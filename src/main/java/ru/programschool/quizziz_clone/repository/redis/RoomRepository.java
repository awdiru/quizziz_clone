package ru.programschool.quizziz_clone.repository.redis;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import ru.programschool.quizziz_clone.model.entity.redis.Room;

@Repository
public interface RoomRepository extends CrudRepository<Room, String> {
}