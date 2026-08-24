package com.resumeiq.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplicationRequest {

    private Long applicantId;

    private Long driveId;

    private Long resumeId;
}