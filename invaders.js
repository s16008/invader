/**
 * Created by s16008 on 17/01/27.
 */
"use strict";

class Player {
    static get  HALF_WIDTH() {
        return 20;
    }

    static get HALF_HEIGHT(){
        return 25;
    }
    constructor(input, x, y, speed, canvas_width) {
        this.input = input;
        this.pos = {'x': x, 'y': y};
        this.bullet = null;
        this.speed = speed;
        this.canvas_width = canvas_width;

    }

    getBullet() {
        return this.bullet;
    }

    move() {
        if (this.input.isLeft && this.input.isRight) {
            //なにもしない
        } else if (this.input.isLeft) {
            this.pos.x -= this.speed;
        } else if (this.input.isRight) {
            this.pos.x += this.speed;
        }
        // 左側へ行き過ぎたら戻す
        if (this.pos.x < Player.HALF_WIDTH) {
            this.pos.x = Player.HALF_WIDTH;
        }
        //右側へ行き過ぎたら戻す
        if (this.pos.x > this.canvas_width - Player.HALF_WIDTH) {
            this.pos.x = this.canvas_width - Player.HALF_WIDTH;
        }
    }

    draw(ctx) {
        this.move();

        if (this.input.isSpace && this.bullet == null) {
            this.bullet = new Bullet(this.pos.x, this.pos.y)
        }
        if (this.bullet != null) {
            this.bullet.draw(ctx);
            if (!this.bullet.isValid()) {
                this.bullet = null;
            }
        }

        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.strokeStyle = "#FFF";
        ctx.fillStyle = "#FFF";

        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(-20, 10);
        ctx.lineTo(-20, -7);
        ctx.lineTo(-3, -7);
        ctx.lineTo(0, -10);
        ctx.lineTo(3, -7);
        ctx.lineTo(20, -7);
        ctx.lineTo(20, 10);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.restore();
    }
}

class Input {
    constructor() {
        this.isLeft = false;
        this.isRight = false;
        this.Space = false;
    }

    onKeyDown(event) {
        switch (event.code) {
            case "ArrowLeft":
                this.isLeft = true;
                break;
            case "ArrowRight":
                this.isRight = true;
                break;
            case "Space":
                this.isSpace = true;
                break;
            default:
                return;
        }
        event.preventDefault();
    }

    onKeyUp(event) {
        switch (event.code) {
            case "ArrowLeft":
                this.isLeft = false;
                break;
            case "ArrowRight":
                this.isRight = false;
                break;
            case "Space":
                this.isSpace = false;
                break;
            default:
                return;
        }
        event.preventDefault();
    }
}

class Bullet {

    static get HALF_WIDTH() {
        return 1.5;
    }

    static get SPEED() {
        return 12;
    }

    static get HALF_HEIGHT() {
        return 5;
    }


    constructor(x, y) {
        this.pos = {'x': x, 'y': y};
        this.isCollied = false;
    }

    move() {
        this.pos.y -= Bullet.SPEED;
    }

    isValid() {
        if (this.isCollied) {
            return false;
        }
        return this.pos.y >= -Bullet.HALF_HEIGHT;

    }

    setInvalidate() {
        this.isCollied = true;
    }


    draw(ctx) {
        this.move();

        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.strokeStyle = "#FFF";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.lineTo(0, 5);
        ctx.stroke();

        ctx.restore();
    }
}

class Enemy {
    static get SIZE() {
        return 64;
    }

    static get HALF_SIZE() {
        return Enemy.SIZE / 2;
    }

    constructor(image, x, y, enemyList) {
        this.image = image;
        this.pos = {'x': x, 'y': y};
        this.enemyList = enemyList;
    }

    move(dx, dy) {
        this.pos.x += dx;
        this.pos.y += dy;
    }

    draw(ctx) {

        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);

//画像サイズの半分を左と上にずらして基準点の真ん中に来るように調整して描画
        ctx.drawImage(this.image, -Enemy.HALF_SIZE, -Enemy.HALF_SIZE,
            Enemy.SIZE, Enemy.SIZE);

        ctx.restore();
    }

    iscollision(bullet) {
        //まず横の判定の準備
        let dx = Math.abs(this.pos.x - bullet.pos.x);
        let dw = Enemy.HALF_SIZE + Bullet.HALF_WIDTH;
        //縦の判定
        let dy = Math.abs(this.pos.y - bullet.pos.y);
        let dh = Enemy.HALF_SIZE + Bullet.HALF_HEIGHT;

        //判定
        return (dx < dw && dy < dh);
    }
}

class EnemyManager {
    constructor(WIDTH,HEIGHT) {
        this.enemyList = [];
        this.dx = 20;
        this.dy = 0;
        this.width = WIDTH;
        this.height = HEIGHT;
        this.enmSpeed = 20;
        this.gameOver = false;
        this.gameScore = 0;
    }

    generateEnemies() {
        let image = new Image();
        image.src = 'enemy.png';
        for (let h = 0; h < 5; h++) {
            for (let w = 0; w < 10; w++) {
                this.enemyList.push(
                    new Enemy(image,
                        50 + Enemy.SIZE * w,
                        50 + Enemy.SIZE * h));
            }
        }
    }

    draw(ctx) {
        this.enemyList.forEach(
            (enemy) => enemy.draw(ctx)
        );
    }

    move() {
        this.enemyList.forEach(
            (enemy) => enemy.move(this.dx, this.dy)
        );
        for (let i = 0; i < this.enemyList.length; i++) {
            if (this.enemyList[i].pos.y > this.height * (14 / 15) - Player.HALF_HEIGHT){
                this.gameOver = true;
            }
            if (this.width - Enemy.HALF_SIZE - this.enmSpeed < this.enemyList[i].pos.x) {
                this.dy = 10;
                if(this.dx > 0){
                    this.dx = Math.abs(this.dx) * -1;
                    break;
                }
            }
            else if(this.enemyList[i].pos.x < Enemy.HALF_SIZE + this.enmSpeed){
                this.dy = 10;
                if (this.dx < 0) {
                    this.dx = Math.abs(this.dx);
                    break;
                }
            }
            else {
                this.dy = 0;
            }
        }
    }


    collision(bullet) {
        if (bullet == null) {
            return;
        }
        const length = this.enemyList.length;
        for (let i = 0; i < length; i++) {
            if (this.enemyList[i].iscollision(bullet)) {
                this.enemyList.splice(i, 1);
                bullet.setInvalidate();
                this.gameScore += 50;
                return;
            }
        }
    }
}

window.addEventListener("DOMContentLoaded", function () {
    // ひつような　定数、変数を設定しておく
    const canvas = document.getElementById("main");
    const ctx = canvas.getContext('2d');
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    const SPF = 1000 / 30;
    const PLAYER_SPEED = 6;
    let count = document.getElementById('score');
    let input = new Input();
    let counter = 0;
    let player = new Player(input, WIDTH / 2, HEIGHT * 14 / 15, PLAYER_SPEED, WIDTH);

    //キーボード入力イベントを　inputクラスとバインド
    document.addEventListener("keydown", (evt) => input.onKeyDown(evt));
    document.addEventListener("keyup", (evt) => input.onKeyUp(evt));

    //enamymanagerの準備
    let manager = new EnemyManager(WIDTH,HEIGHT);
    manager.generateEnemies();

    /*
     let enemyImage = new Image();
     enemyImage.src = 'enemy.png';
     let enemy = new Enemy(enemyImage, 300, 400);
     */
    //メインループ
        let mainLoop = function () {
            //画面消去
            ctx.clearRect(0, 0, WIDTH, HEIGHT);

            //プレイヤーの描画
            player.draw(ctx);

            counter += 1;

            manager.collision(player.getBullet());

            count.innerHTML = manager.gameScore;
            manager.draw(ctx);

            if (manager.enemyList.length == 0){
                ctx.font = "80px 'MS Pゴシック'";
                ctx.fillStyle = 'white';
                ctx.fillText('GAME CLEAR', 200,300);
            }

            if (counter == 20) {
                manager.move();
                counter = 0;
            }
            else if (manager.enemyList.length <= 35 && counter == 15) {
                manager.move();
                counter = 0;
            }
            else if (manager.enemyList.length <= 25 && counter == 10) {
                manager.move();
                counter = 0;
            }
            else if (manager.enemyList.length <= 10 && counter == 5) {
                manager.move();
                counter = 0;
            }
            else if (manager.enemyList.length <= 5 && counter == 3) {
                manager.move();
                counter = 0;
            }
        //再度この関数を呼び出す予約をする
            if(manager.gameOver == false){
                setTimeout(mainLoop, SPF);
            }else{
                ctx.font = "80px 'MS Pゴシック'";
                ctx.fillStyle = 'red';
                ctx.fillText('GAME OVER', 200,300);
            }
    };
    //ゲーム起動開始
    setTimeout(mainLoop, SPF);
});