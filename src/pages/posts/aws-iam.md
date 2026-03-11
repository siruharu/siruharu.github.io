---
layout: ../../layouts/PostLayout.astro
title: "AWS : IAM"
date: 2026-03-11
description: "AWS IAM 소개 : 사용자 , 그룹, 정책"
category: AWS SAA-C03
tags:
  - IAM
---
# IAM 이란?

> Identity and Access Management의 줄임말 , Global service 

* IAM 에서는 사용자를 생성하고 그룹에 배치하기 때문에 글로벌 서비스에 해당된다.
* 우리는 모르는 사이에 이미 IAM 을 사용했다.
* 계정을 생성할 때 루트 계정을 만들었는데 이는 기본으로 생성되는 것
* 루트 계정은 오롯이 계정을 생성할 때만 써야함. 그 후에는  루트 계정을 더 이상 사용해서도, 공유해서도 안됨 대신 사용자를 생성해야함.
* 그룹 설정도 가능하다.

## IAM: Permissions

* 유저와 그룹에 대한 권한을 json 문서로 구성해서 설정 가능하다 해당 형태는 아래의 형태와 비슷하다

```json
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "ec2:Describe*",
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": "elasticloadbalancing:Describe*",
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudwatch:ListMetrics",
        "cloudwatch:GetMetricsStatistics",
        "cloudwatch:Describe*"
      ],
      "Resource": "*"
    }
  ]
```

* 해당형태는 영어로 구성되어있고 어떤사용자가 어떤 작업에 권한을 가지고 있는지 설명되어 있는 부분
* aws에서의 권한은 최소 권한의 원칙을 적용한다.
