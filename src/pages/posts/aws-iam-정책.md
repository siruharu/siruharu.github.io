---
layout: ../../layouts/PostLayout.astro
title: "AWS: IAM 정책"
date: 2026-03-11
description: "AWS: IAM 정책"
category: AWS SAA-C03
tags:
  - IAM
  - Policies
---
## IAM 정책정리

1. **IAM 정책 적용 대상** </br>
   IAM 정책은 다음 단위에 부여할 수 있다.

* **User (사용자)**
* **Group(그룹)**
* **Role (역할)**

- - -

2. **그룹 기반 권한 관리 (권장 방식)** </br>

* 여러 사용자에게 동일한 권한을 부여할 때 사용
* 관리 효율성과 확장성이 가장 좋음
  </br></br>
  **예시**
* 사용자 : a,b,c,d
* 그룹: 개발자 그룹
  </br>
  👉 a, b, c를 개발자 그룹에 포함시키면 </br>
  → 그룹에 설정된 정책을 모든 사용자(a, b, c)가 공유

- - -

3. **다중 그룹 소속 (권한 누적)**

* 사용자는 여러 그룹에 속할 수 있다.
* 모든 그룹의 정책이 **합산(Union)**되어 적용된다
  </br></br>
  **예시)**
* c → 개발자 그룹 + 프로젝트 그룹
* d → 프로젝트 그룹만 소속 </br>
  👉 c는 두 그룹의 권한을 모두 가지게 됨

- - -

4. 인라인 정책 (Inline Policy)

* 특정 사용자(User), 그룹(Group), 역할(Role)에 **직접 붙이는 정책**
* 해당 대상에게만 종속됨 (재사용 불가)

**특징**

* 개별 사용자에 대한 **예외 권한 설정**에 사용
* 재사용성이 없어서 관리가 어려움</br>
  👉 예: 특정 사용자 d에게만 S3 접근 허용

- - -

5. **관리형 정책(Managed Policy) vs 인라인 정책**</br>

* 재사용

  * Managed Policy : 가능
  * Inline Policy : 불가능
* 관리

  * Managed Policy : 중앙 관리
  * Inline Policy : 개별 관리
* 추천 여부

  * Managed Policy : 권장
  * Inline Policy : 제한적 사용

기본은 **Managed Policy + Group** 기반 설계

- - -

## IAM 정책 구조(JSON)
> IAM 정책은 JSON 형태로 작성되며, **권한(허용/거부)**을 정의하는 **선언문(Statement)**의 집합이다.

```json
{
  "Version": "2012-10-17",
  "id": "S3-Account-Permissions",
  "Statement": [
    {
      "Sid": "1",
      "Effect": "Allow",
      "Principal": {
        "AWS": ["arn:aws:iam::123456789012:root"]
      },
      "Action": [
        "s3:getObject",
        "s3:PutObject"
      ],
      "Resource": ["arn:aws:s3:::mybucket/*"]
    }
  ]
}
```

### 주요 구성 요소 설명
1. Version
  - 정책 문법 버전
  - 대부분 `2012-10-17` 사용 (사실상 표준)
  - 이 값은 날짜가 아니라 정책 언어 버전이다.
---
2. Id (선택)
  - 정책 자체를 식별하는 ID
  - 필수는 아님
  - 정책 관리 / 추적용
  - 리소스 정책(S3, SNS등)에서 더 자주 사용됨
---
3. Statement(핵심)
  - 실제 권한을 정의하는 블록
  - 배열 형태로 여러 개 정의 가능
  - IAM 정책의 **실질적인 로직**은 전부 여기 있다고 보면 된다.

---

### Statement 내부 구조
3-1. Sid (선택)
  - Statement 식별자
  - 사람이 읽기 쉽게 구분하는 용도
  - 예) `"Sid": "AllowS3ReadAccess"`
---
3-2. Effect (필수)
- 권한의 결과
  - Allow : 허용
  - Deny  : 명시적 거부
- **Deny가 Allow보다 우선순위 높음**
---
3-3. Principal (조건부 필수)
- 누가 이 정책의 대상인가
- 주로 **리소스 기반 정책(S3 Bucket Policy 등)** 에서 사용
- 예) `
  "Principal": { 
    "AWS": "arn:aws:iam::123456789012:user/Alice"
  }
`
- IAM User/Group 정책에는 보통 없음
- 리소스 정책에서 **필수**

---
3-4. Action (필수)
- 허용/거부할 AWS API 작업
- 예) 
  - `"s3:GetObject"`
  - `"ec2:StartInstances"`
- 와일드 카드 가능
  - `"s3:*"`
---
3-5. Resource (필수)
- 대상 리소스의 ARN
- 예)
  - `"arn:aws:s3:::mybucket/*"`
- 의미: 해당 버킷 내부 모든 객체
---
3-6. Condition(선택, 고급)
- 조건 기반 권한 제어
- 예)
  - ```json
    "Condition": {
      "IpAddress": {
        "aws:SourceIp": "192.168.1.0/24"
      }
    }
    ```
- 활용
  - IP 제한
  - MFA 요구
  - 시간제한

--- 
## 구조 요약
-  누가 (Principal)
-  무엇을 (Action)
-  어디에 (Resource)
-  어떤 조건에서 (Condition)
-  허용/거부 (Effect)

---
### 중요 포인트
1. Deny 우선
- 명시적 Deny가 있으면 무조건 거부한다.
---
2. 정책은 "합산"된다
- User + Group + Role + Resource Policy 모두 합쳐서 평가
---
3. Principal 위치 주의
- IAM 정책: 없음
- S3 Bucket Policy 등 : 있음
---
4. 최소 권한 원칙 (Least Privilege)
- `"*"` 남발하면 감점 포인트


---
### 몰랐던 용어 정리

** ARN(Amazon Resource Name) 이란?**
- AWS 리소스를 고유하게 식별하는 이름(ID)

** 기본 구조 ** </br>
`arn:partition:service:region:account-id:resource`

** 각 구성 요소 설명 **
1. arn
- 항상 `"arn"` 으로 시작(고정값)

2. partition
- AWS 환경 구분
  - aws : 일반 AWS
  - aws-cn : 중국
  - aws-us-gov: GovCloud

3. service
- 서비스 이름
- 예)
  - s3
  - ec2
  - iam
  - lambda

4. region
- 리소스가 존재하는 리전
- 예)
  - ap-northeast-2(서울)
  - us-east-1
  - 일부 서비스(IAM, S3)는 region이 없음

5. account-id
- AWS 계정 ID(12자리 숫자)
- 예) 123456789012

6. resource (핵심)
- 실제 리소스 이름
- 형식은 서비스마다 다르다.
--- 

