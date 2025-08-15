// Phaser는 CDN으로 로드됨

// 간단한 테스트 씬
class TestScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TestScene' });
    }

    preload() {
        console.log('TestScene preload 시작');
    }

    create() {
        console.log('TestScene create 시작');
        
        // 화면 중앙 계산
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        
        // 디버깅 정보 출력
        console.log('화면 크기:', this.cameras.main.width, 'x', this.cameras.main.height);
        console.log('중앙 좌표:', centerX, centerY);
        
        // 간단한 텍스트 표시
        this.add.text(centerX, centerY - 25, '던전 게임 테스트', {
            fontSize: '48px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        
        // 플레이어 위치 표시
        this.add.text(centerX, centerY + 25, 'S 위치: 시작점', {
            fontSize: '24px',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2,
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        
        console.log('TestScene create 완료');
    }

    update() {
        // 아무것도 하지 않음
    }
}

// 게임 설정
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#333333',
    scene: TestScene,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

console.log('게임 설정 완료, Phaser.Game 생성 시작');

// 게임 인스턴스 생성
try {
    const game = new Phaser.Game(config);
    console.log('Phaser.Game 인스턴스 생성 완료');
} catch (error) {
    console.error('Phaser.Game 생성 중 오류:', error);
}
