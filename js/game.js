// 게임 설정
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#87CEEB', // 하늘색 배경
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: true  // 물리 디버그 활성화하여 충돌 박스 확인
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// 게임 인스턴스 생성
const game = new Phaser.Game(config);

// 전역 변수
let player;
let cursors;
let platforms;
let stars;
let score = 0;
let scoreText;
let keys; // 키보드 키 객체들
let canJump = true; // 점프 가능 여부

// 에셋 로드
function preload() {
    console.log('에셋 로드 시작...');
    
    // 걷는 애니메이션용 스프라이트들 로드
    this.load.image('player_walking1', 'assets/sprites/player_walking1.png');
    this.load.image('player_walking2', 'assets/sprites/player_walking2.png');
    
    // 로드 완료 이벤트 추가
    this.load.on('complete', function () {
        console.log('모든 에셋 로드 완료!');
        console.log('로드된 텍스처들:', this.textures.list);
    }, this);
    
    // Canvas를 사용해서 간단한 스프라이트 생성 (백업용)
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // 플레이어 스프라이트 그리기 (초록색 사각형) - 백업용
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(0, 0, 32, 32);
    
    // Canvas를 텍스처로 변환 (백업용)
    this.textures.addCanvas('player_backup', canvas);
    this.textures.addCanvas('ground', canvas);
    this.textures.addCanvas('star', canvas);
    
    console.log('에셋 로드 완료');
}

// 게임 객체 생성
function create() {
    console.log('게임 객체 생성 시작...');
    
    // 플랫폼 그룹 생성
    platforms = this.physics.add.staticGroup();
    
    // 바닥 플랫폼 - 올바른 크기로 설정
    platforms.create(400, 568, 'ground').setDisplaySize(800, 32).refreshBody();
    
    // 중간 플랫폼들 - 올바른 크기로 설정
    platforms.create(600, 400, 'ground').setDisplaySize(200, 32).refreshBody();
    platforms.create(50, 250, 'ground').setDisplaySize(200, 32).refreshBody();
    platforms.create(750, 220, 'ground').setDisplaySize(200, 32).refreshBody();
    
    // 플랫폼 색상 설정
    platforms.children.iterate(function (child) {
        child.setTint(0x8B4513); // 갈색
    });
    
    // 플레이어 생성
    console.log('플레이어 생성 중...');
    
    // 스프라이트가 로드되었는지 확인
    if (this.textures.exists('player_walking1')) {
        player = this.physics.add.sprite(100, 100, 'player_walking1');
    } else {
        // 백업 스프라이트 사용
        console.log('백업 스프라이트 사용');
        player = this.physics.add.sprite(100, 100, 'player_backup');
    }
    
    // 플레이어가 제대로 생성되었는지 확인
    if (!player) {
        console.error('플레이어 생성 실패!');
        return;
    }
    
    player.setScale(0.9)
          .setBounce(0.2)
          .setCollideWorldBounds(true);
    
    // 시각 스프라이트 크기 가져오기
    const sw = player.width, sh = player.height;
    
    // 바디 크기와 오프셋 조절 (발 부분이 플랫폼에 맞닿도록)
    player.body.setSize(sw * 0.5, sh * 0.8);
    player.body.setOffset((sw * 0.5) / 2, sh * 0.2);
    
    // 걷기 애니메이션 설정
    this.anims.create({
        key: 'walk',
        frames: [
            { key: 'player_walking1' },
            { key: 'player_walking2' }
        ],
        frameRate: 6, // 초당 6프레임으로 애니메이션 재생 (더 자연스러운 걷기)
        repeat: -1 // 무한 반복
    });
    
    // 서있을 때 애니메이션 (walking1 스프라이트 사용)
    this.anims.create({
        key: 'idle',
        frames: [
            { key: 'player_walking1' }
        ],
        frameRate: 1,
        repeat: -1
    });
    
    // 애니메이션 디버깅을 위한 이벤트 리스너 (Phaser 3.90.0 호환)
    this.anims.on('animationstart', function (animation, frame, gameObject) {
        console.log('애니메이션 시작:', animation.key);
    });
    
    this.anims.on('animationcomplete', function (animation, frame, gameObject) {
        console.log('애니메이션 완료:', animation.key);
    });
    
    // 초기 애니메이션 설정
    player.anims.play('idle');
    
    console.log('플레이어 생성 완료:', player);
    console.log('애니메이션 생성 완료 - walk, idle');
    // 애니메이션 키 목록 출력 (Phaser 3.90.0 호환)
    console.log('애니메이션 키 목록:', Array.from(this.anims.anims.keys()));
    
    // 플레이어와 플랫폼 충돌 설정
    this.physics.add.collider(player, platforms);
    
    // 플레이어 애니메이션 완료 이벤트는 제거 (Phaser 3에서는 다른 방법 사용)
    // player.on('animationcomplete', function () {
    //     console.log('플레이어 애니메이션 완료');
    // });
    
    // 별 그룹 생성
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });
    
    // 별 색상 설정
    stars.children.iterate(function (child) {
        child.setTint(0xFFFF00); // 노란색
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });
    
    // 별과 플랫폼 충돌 설정
    this.physics.add.collider(stars, platforms);
    
    // 플레이어와 별 충돌 설정
    this.physics.add.overlap(player, stars, collectStar, null, this);
    
    // 점수 텍스트
    scoreText = this.add.text(16, 16, '점수: 0', { 
        fontSize: '32px', 
        fill: '#000',
        stroke: '#fff',
        strokeThickness: 4
    });
    
    // 게임 제목
    this.add.text(400, 50, '캐릭터 스프라이트 연습', { 
        fontSize: '24px', 
        fill: '#000',
        stroke: '#fff',
        strokeThickness: 2
    }).setOrigin(0.5);
    
    // 조작키 설정
    cursors = this.input.keyboard.createCursorKeys();
    
    // 추가 키 설정
    keys = this.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D,
        SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE
    });
    
    // 마우스 클릭 이벤트
    this.input.on('pointerdown', function (pointer) {
        // 클릭한 위치로 플레이어 이동
        this.tweens.add({
            targets: player,
            x: pointer.x,
            y: pointer.y,
            duration: 1000,
            ease: 'Power2'
        });
    }, this);
}

// 게임 업데이트 루프
function update() {
    // player가 정의되지 않았으면 업데이트하지 않음
    if (!player) {
        console.log('플레이어가 정의되지 않음');
        return;
    }
    
    // 키보드 입력 상태 확인
    let leftPressed = false;
    let rightPressed = false;
    let upPressed = false;
    let downPressed = false;
    
    // 화살표 키 확인
    if (cursors) {
        if (cursors.left && cursors.left.isDown) leftPressed = true;
        if (cursors.right && cursors.right.isDown) rightPressed = true;
        if (cursors.up && cursors.up.isDown) upPressed = true;
        if (cursors.down && cursors.down.isDown) downPressed = true;
    }
    
    // WASD 키 확인
    if (keys) {
        if (keys.A && keys.A.isDown) leftPressed = true;
        if (keys.D && keys.D.isDown) rightPressed = true;
        if (keys.W && keys.W.isDown) upPressed = true;
        if (keys.S && keys.S.isDown) downPressed = true;
    }
    
    // 키보드 입력 디버깅
    if (leftPressed) console.log('왼쪽 키 눌림');
    if (rightPressed) console.log('오른쪽 키 눌림');
    if (upPressed) console.log('위쪽 키 눌림');
    if (downPressed) console.log('아래쪽 키 눌림');
    
    // 키보드 입력 처리
    if (leftPressed) {
        console.log('왼쪽 이동 중...');
        player.setVelocityX(-160);
        player.setFlipX(true);
        // 걷기 애니메이션 재생 (Phaser 3.90.0 호환)
        if (!player.anims.isPlaying || player.anims.currentAnim.key !== 'walk') {
            player.anims.play('walk', true);
        }
    } else if (rightPressed) {
        console.log('오른쪽 이동 중...');
        player.setVelocityX(160);
        player.setFlipX(false);
        // 걷기 애니메이션 재생 (Phaser 3.90.0 호환)
        if (!player.anims.isPlaying || player.anims.currentAnim.key !== 'walk') {
            player.anims.play('walk', true);
        }
    } else {
        player.setVelocityX(0);
        // 서있을 때 기본 애니메이션 재생 (Phaser 3.90.0 호환)
        if (!player.anims.isPlaying || player.anims.currentAnim.key !== 'idle') {
            player.anims.play('idle', true);
        }
    }
    
    // 점프 처리 - blocked.down 중심의 착지 판정
    const isJumpPressed = upPressed || (keys && keys.SPACE && keys.SPACE.isDown);
    const onGround = player.body && player.body.blocked && player.body.blocked.down; // blocked.down 중심으로 착지 판정
    
    // 바닥에 닿아있을 때 점프 가능 상태로 설정
    if (onGround) {
        canJump = true;
    }
    
    // 점프 키가 눌렸고 점프 가능할 때만 점프
    if (isJumpPressed && canJump && onGround) {
        player.setVelocityY(-330);
        canJump = false; // 점프 후 다시 점프 불가능하게 설정
        console.log('점프 성공!');
    }
    
    // S키로 아래로 이동 (공중에서만 허용)
    if (downPressed && !onGround) {
        player.setVelocityY(100);
    }
    
    // 플레이어가 바닥에 닿아있을 때만 바운스 설정
    if (onGround) {
        player.setBounce(0.2);
    } else {
        player.setBounce(0);
    }
}

// 별 수집 함수
function collectStar(player, star) {
    star.disableBody(true, true);
    
    score += 10;
    scoreText.setText('점수: ' + score);
    
    // 수집 효과 (플레이어 크기 변화)
    player.setScale(1.35);
    setTimeout(() => {
        player.setScale(0.9);
    }, 100);
    
    // 모든 별을 수집했는지 확인
    if (stars.countActive(true) === 0) {
        // 축하 메시지 - game 객체를 통해 텍스트 추가
        const gameScene = player.scene;
        if (gameScene) {
            gameScene.add.text(400, 300, '모든 별을 수집했습니다!', { 
                fontSize: '32px', 
                fill: '#FFD700',
                stroke: '#000',
                strokeThickness: 4
            }).setOrigin(0.5);
        }
        
        // 3초 후 별들 재생성
        setTimeout(() => {
            stars.children.iterate(function (child) {
                child.enableBody(true, child.x, 0, true, true);
            });
        }, 3000);
    }
} 