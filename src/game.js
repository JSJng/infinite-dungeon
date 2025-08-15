// Phaser는 CDN으로 로드됨
// DungeonScene 클래스는 이미 정의됨

// 게임 설정
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: DungeonScene,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// 게임 인스턴스 생성
const game = new Phaser.Game(config);
