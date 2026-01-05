package ru.programschool.quizziz_clone.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import ru.programschool.quizziz_clone.model.dto.user.UserSearchDto;
import ru.programschool.quizziz_clone.model.entity.postgrsql.User;
import ru.programschool.quizziz_clone.repository.postgrsql.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class UserService {
    private final UserRepository userRepository;

    public List<UserSearchDto> search(String query, User user) {
        List<User> users = userRepository.searchUsers(query, PageRequest.of(0, 10));
        return users.stream()
                .filter(u -> !u.getEmail().equals(user.getEmail()))
                .map(this::toUserDto)
                .toList();
    }

    private UserSearchDto toUserDto(User user) {
        return UserSearchDto.builder()
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }
}
