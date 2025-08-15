# Phaser 3.90.0 호환성 수정사항

이 문서는 Phaser 3.90.0 버전으로 업그레이드하면서 발생한 호환성 문제들과 그 해결방법을 정리한 것입니다.

## 1. 애니메이션 이벤트 리스너 수정

### 문제
```
Cannot read properties of undefined (reading 'on')
```

### 원인
Phaser 3.90.0에서 애니메이션 플러그인(AnimationPlugin)의 이벤트 구독 방식이 변경되었습니다. `this.anims.events` 중간 단계를 거치지 않고 곧바로 `this.anims.on()`으로 구독해야 합니다.

### 수정 전 (잘못된 코드)
```javascript
// ❌ 잘못된 코드
this.anims.events.on('animationstart', function (anim) {
    console.log('애니메이션 시작:', anim.key);
});

this.anims.events.on('animationcomplete', function (anim) {
    console.log('애니메이션 완료:', anim.key);
});
```

### 수정 후 (올바른 코드)
```javascript
// ✅ 올바른 코드 (Phaser 3.90.0 기준)
this.anims.on('animationstart', function (animation, frame, gameObject) {
    console.log('애니메이션 시작:', animation.key);
});

this.anims.on('animationcomplete', function (animation, frame, gameObject) {
    console.log('애니메이션 완료:', animation.key);
});
```

## 2. AnimationState API 변경사항

### 문제
```
getCurrentKey is not a function
```

### 원인
Phaser 3.90.0부터 AnimationState API가 바뀌면서 `getCurrentKey()` 메서드가 더 이상 제공되지 않습니다.

### 수정 전 (잘못된 코드)
```javascript
// ❌ 잘못된 코드
if (player.anims && player.anims.getCurrentKey() !== 'walk') {
    player.anims.play('walk', true);
}
```

### 수정 후 (올바른 코드)
```javascript
// ✅ 올바른 코드 (Phaser 3.90.0 기준)
if (!player.anims.isPlaying || player.anims.currentAnim.key !== 'walk') {
    player.anims.play('walk', true);
}
```

## 3. 애니메이션 목록 출력 수정

### 문제
```
getAnimationKeys is not a function
```

### 원인
`getAnimationKeys()` 메서드가 Phaser 3.90.0에서 제공되지 않습니다.

### 수정 전 (잘못된 코드)
```javascript
// ❌ 잘못된 코드
console.log('사용 가능한 애니메이션들:', this.anims.getAnimationKeys());
```

### 수정 후 (올바른 코드)
```javascript
// ✅ 올바른 코드 (Phaser 3.90.0 기준)
console.log('애니메이션 키 목록:', Array.from(this.anims.anims.keys()));
```

## 4. 전체 수정된 코드 예시

### create 함수 중 relevant 부분
```javascript
function create() {
    // ... 이전 코드 생략 ...

    // 걷기 애니메이션 설정
    this.anims.create({
        key: 'walk',
        frames: [
            { key: 'player_walking1' },
            { key: 'player_walking2' }
        ],
        frameRate: 6,
        repeat: -1
    });

    // 서있을 때 애니메이션
    this.anims.create({
        key: 'idle',
        frames: [
            { key: 'player_walking1' }
        ],
        frameRate: 1,
        repeat: -1
    });

    // ✅ 수정된 부분: 애니메이션 이벤트 리스너 등록
    this.anims.on('animationstart', function (animation, frame, gameObject) {
        console.log('애니메이션 시작:', animation.key);
    });

    this.anims.on('animationcomplete', function (animation, frame, gameObject) {
        console.log('애니메이션 완료:', animation.key);
    });

    // 초기 애니메이션 재생
    player.anims.play('idle');

    // ✅ 수정된 부분: 애니메이션 목록 출력
    console.log('애니메이션 키 목록:', Array.from(this.anims.anims.keys()));

    // ... 이하 충돌 설정 등 계속 ...
}
```

### update 함수 중 relevant 부분
```javascript
function update() {
    // ... 입력 처리 코드 ...

    if (leftPressed) {
        player.setVelocityX(-160);
        player.setFlipX(true);
        // ✅ 수정된 부분: 현재 애니메이션이 'walk'가 아닐 때만 재생
        if (!player.anims.isPlaying || player.anims.currentAnim.key !== 'walk') {
            player.anims.play('walk', true);
        }
    } else if (rightPressed) {
        player.setVelocityX(160);
        player.setFlipX(false);
        // ✅ 수정된 부분: 현재 애니메이션이 'walk'가 아닐 때만 재생
        if (!player.anims.isPlaying || player.anims.currentAnim.key !== 'walk') {
            player.anims.play('walk', true);
        }
    } else {
        player.setVelocityX(0);
        // ✅ 수정된 부분: 현재 애니메이션이 'idle'이 아닐 때만 재생
        if (!player.anims.isPlaying || player.anims.currentAnim.key !== 'idle') {
            player.anims.play('idle', true);
        }
    }

    // ... 점프 처리 등 나머지 업데이트 ...
}
```

## 5. 주요 변경사항 요약

1. **애니메이션 이벤트 구독**: `this.anims.events.on()` → `this.anims.on()`
2. **현재 애니메이션 확인**: `getCurrentKey()` → `currentAnim.key`
3. **애니메이션 목록 출력**: `getAnimationKeys()` → `Array.from(this.anims.anims.keys())`
4. **안전성 개선**: `isPlaying` 체크 추가로 애니메이션 전환 최적화

## 6. 참고사항

- Phaser 3.90.0 공식 문서: https://docs.phaser.io
- 이 수정사항들은 Phaser 3.90.0 기준으로 작성되었습니다
- 향후 Phaser 버전 업데이트 시 추가적인 호환성 문제가 발생할 수 있습니다

---

**작성일**: 2024년  
**Phaser 버전**: 3.90.0  
**프로젝트**: infinite-dungeon
