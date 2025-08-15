class DungeonScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DungeonScene' });
        this.tileSize = 64; // 타일 크기 (4배 확대)
        this.dungeonMap = null;
        this.walls = null;
        this.player = null;
        this.floorTiles = null;
    }

    preload() {
        // 던전 지도 텍스트 파일 로드
        this.load.text('dungeonMap', 'assets/maps/dungeon_map.txt');
        
        // 던전 타일 스프라이트 로드
        this.load.image('dungeon_tile', 'assets/sprites/dungeon/dungeon.png');
        
        // 플레이어 스프라이트 로드
        this.load.image('player', 'assets/sprites/player/player_down1.png');
    }

    create() {
        // 던전 지도 로드
        this.loadDungeonMap();
        
        // 카메라 설정
        this.cameras.main.setBounds(0, 0, this.dungeonMap.width * this.tileSize, this.dungeonMap.height * this.tileSize);
        this.cameras.main.setZoom(1);
        
        // 플레이어 생성 (시작점 S 위치)
        this.createPlayer();
        
        // 카메라가 플레이어를 따라가도록 설정
        this.cameras.main.startFollow(this.player);
    }

    loadDungeonMap() {
        const mapText = this.cache.text.get('dungeonMap');
        const lines = mapText.split('\n').filter(line => line.trim());
        
        this.dungeonMap = {
            width: lines[0].length,
            height: lines.length,
            data: lines
        };

        // 벽 그룹 생성
        this.walls = this.physics.add.staticGroup();
        
        // 바닥 타일 그룹 생성
        this.floorTiles = this.add.group();
        
        // 지도 렌더링
        for (let y = 0; y < this.dungeonMap.height; y++) {
            for (let x = 0; x < this.dungeonMap.width; x++) {
                const char = this.dungeonMap.data[y][x];
                const worldX = x * this.tileSize;
                const worldY = y * this.tileSize;
                
                if (char === '□') {
                    // 벽 생성 - 던전 타일 이미지 사용
                    const wall = this.add.image(worldX + this.tileSize/2, worldY + this.tileSize/2, 'dungeon_tile');
                    wall.setDisplaySize(this.tileSize, this.tileSize);
                    wall.setTint(0x666666); // 벽은 어둡게
                    this.walls.add(wall);
                } else if (char === ' ' || char === 'S') {
                    // 바닥 타일 생성 - 던전 타일 이미지 사용
                    const floor = this.add.image(worldX + this.tileSize/2, worldY + this.tileSize/2, 'dungeon_tile');
                    floor.setDisplaySize(this.tileSize, this.tileSize);
                    floor.setTint(0x333333); // 바닥은 더 어둡게
                    this.floorTiles.add(floor);
                }
            }
        }
        
        // 바닥 타일을 벽 뒤에 배치
        this.floorTiles.setDepth(0);
        this.walls.setDepth(1);
    }

    createPlayer() {
        // 시작점 S 찾기
        let startX = 0, startY = 0;
        for (let y = 0; y < this.dungeonMap.height; y++) {
            for (let x = 0; x < this.dungeonMap.width; x++) {
                if (this.dungeonMap.data[y][x] === 'S') {
                    startX = x * this.tileSize + this.tileSize/2;
                    startY = y * this.tileSize + this.tileSize/2;
                    break;
                }
            }
            if (startX > 0) break;
        }
        
        // 플레이어 생성
        this.player = this.physics.add.sprite(startX, startY, 'player');
        this.player.setCollideWorldBounds(false);
        this.player.setDepth(2); // 플레이어를 최상단에 배치
        
        // 플레이어와 벽 충돌 설정
        this.physics.add.collider(this.player, this.walls);
        
        // 플레이어 크기 조정 (던전은 2배, 캐릭터는 1/2)
        this.player.setScale(0.5);
    }

    update() {
        // 플레이어 이동 처리
        this.handlePlayerMovement();
    }

    handlePlayerMovement() {
        const cursors = this.input.keyboard.createCursorKeys();
        const speed = 100;
        
        // 이동 방향 설정
        let velocityX = 0;
        let velocityY = 0;
        
        if (cursors.left.isDown) {
            velocityX = -speed;
        } else if (cursors.right.isDown) {
            velocityX = speed;
        }
        
        if (cursors.up.isDown) {
            velocityY = -speed;
        } else if (cursors.down.isDown) {
            velocityY = speed;
        }
        
        // 대각선 이동 시 속도 정규화
        if (velocityX !== 0 && velocityY !== 0) {
            velocityX *= 0.707;
            velocityY *= 0.707;
        }
        
        // 플레이어 속도 설정
        this.player.setVelocity(velocityX, velocityY);
        
        // 애니메이션 처리
        if (velocityX !== 0 || velocityY !== 0) {
            // 이동 중일 때 애니메이션
            this.player.anims.play('walk', true);
        } else {
            // 정지 시 애니메이션 정지
            this.player.anims.stop();
        }
    }
}
