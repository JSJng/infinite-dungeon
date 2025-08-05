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
            debug: false  // 물리 디버그 비활성화
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
    
    // 실제 스프라이트 파일 로드
    this.load.image('player', 'assets/sprites/player.png');
    
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
    player = this.physics.add.sprite(100, 450, 'player');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    // player.setTint(0x00ff00); // 초록색으로 설정 - 실제 스프라이트 사용 시 주석처리
    player.setScale(1); // 스프라이트 크기 조정 - 원래 크기로 설정
    
    // 투명도 설정 (필요시)
    // player.setAlpha(0.8); // 80% 투명도
    
    console.log('플레이어 생성 완료:', player);
    
    // 플레이어와 플랫폼 충돌 설정
    this.physics.add.collider(player, platforms);
    
    // 플레이어가 바닥에 닿았을 때 이벤트
    player.on('animationcomplete', function () {
        console.log('플레이어 애니메이션 완료');
    });
    
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
    // 키보드 입력 처리 - 더 간단한 버전
    if (cursors.left.isDown || keys.A.isDown) {
        player.setVelocityX(-160);
        player.setFlipX(true);
    } else if (cursors.right.isDown || keys.D.isDown) {
        player.setVelocityX(160);
        player.setFlipX(false);
    } else {
        player.setVelocityX(0);
    }
    
    // 점프 처리 - 강화된 착지 판정
    const isJumpPressed = cursors.up.isDown || keys.W.isDown || keys.SPACE.isDown;
    const onGround = player.body.touching.down || player.body.blocked.down;
    
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
    
    // S키로 아래로 이동 (옵션)
    if (keys.S.isDown) {
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
    player.setScale(1.5);
    setTimeout(() => {
        player.setScale(1);
    }, 100);
    
    // 모든 별을 수집했는지 확인
    if (stars.countActive(true) === 0) {
        // 축하 메시지
        this.add.text(400, 300, '모든 별을 수집했습니다!', { 
            fontSize: '32px', 
            fill: '#FFD700',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // 3초 후 별들 재생성
        setTimeout(() => {
            stars.children.iterate(function (child) {
                child.enableBody(true, child.x, 0, true, true);
            });
        }, 3000);
    }
} 