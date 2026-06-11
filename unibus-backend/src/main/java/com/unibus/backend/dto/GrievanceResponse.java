package com.unibus.backend.dto;

import com.unibus.backend.entity.Grievance;
import com.unibus.backend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrievanceResponse {
    private Grievance grievance;
    private User user;
}
