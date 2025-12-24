package ru.programschool.quizziz_clone.controller;

import lombok.RequiredArgsConstructor;
import ru.programschool.quizziz_clone.model.entity.postgrsql.User;
import ru.programschool.quizziz_clone.repository.postgrsql.UserRepository;

import java.security.Principal;

@RequiredArgsConstructor
public abstract class BaseController {
    protected final UserRepository userRepository;

    protected User getUserFromPrincipal(Principal principal) {
        return userRepository.findByEmail(principal.getName()).get();
    }
}
