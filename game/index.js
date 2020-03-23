// 控制游戏的主逻辑
class Game {
    constructor(id, snake, food, stone) {
        // 选择地图对象
        this.map = document.querySelector(id);
        this.rows = 20; // 代表行
        this.columns = 20; // 列
        this.size = 20; // 大小
        // 挂载蛇对象
        this.snake = snake;
        this.maps = []; // 地图的坐标信息
        this.timer = null; // 蛇运动端句柄
        this.food = food;

        this.score = 0; // 默认 0 分
        this.level1Score = 10; // 第一关得到 10 分就赢了

        this.stone = stone;

        this.lock = true; // 加把锁，默认打开

        this.init();
    }
    init() {
        // 增加地图样式
        this.addMayStyle();
        // 渲染地图
        this.renderMap();
        // 渲染蛇
        this.renderSnake();
        // 开始游戏
        this.start();

        // 绑定键盘事件
        this.bindEvent();

        // 随机食物坐标
        this.randomCoordinate();
        // 根据随机后的坐标渲染食物
        this.renderFood();

        // 增加分数的样式
        this.addScoreStyle();

        // 渲染障碍物
        this.renderStone();
    }
    addMayStyle() {
        this.map.className = 'game';
        this.map.style.width = this.columns * this.size + 'px';
        this.map.style.height = this.rows * this.size + 'px';
    }
    renderMap() {
        for(let i = 0; i < this.rows; i ++) {
            // 创建行
            let row = document.createElement('div');
            row.className = 'row';
            // 缓存地图的坐标信息
            let arr = [];
            for(let j = 0; j < this.columns; j ++) {
                let column = document.createElement('div');
                column.className = 'column';
                // 把列装到行里面
                row.appendChild(column);
                arr.push(column);
            }
            // 把每一行加到地图上面
            this.map.appendChild(row);
            this.maps.push(arr);
        }
        // console.log(this.maps);
    }

    renderSnake() {
        // 先准备地图的坐标信息，在里面找“蛇头” 和 “蛇身体” 改变颜色
        for(let i = 0; i < this.snake.length; i ++) {
            this.maps[this.snake[i].row][this.snake[i].column].style.backgroundColor = i === 0 ? 'red' : 'green';
        }
    }
    start() {
        // 让蛇跑起来
        this.timer = setInterval(() => {
            this.snake.move(); // 控制蛇的运动
            
            // 判断蛇头是否撞墙，蛇头撞到蛇身体也要 GameOver，蛇头撞到障碍物
            if (this.knockedEdge() || this.snake.kill() || this.knockedStone()) {
                this.gameOver();
                return;
            }
            // 检测是否吃到食物
            if(this.isEatedFood()) {
                // 1. 蛇身体增加
                this.snake.growUp();
                // 2. 随机食物坐标
                this.randomCoordinate();
            }

            // 清除之前的坐标信息
            this.clear();
            // 根据蛇的最新坐标信息重新渲染
            this.renderSnake();
            // 渲染食物
            this.renderFood();
            // 渲染石头障碍物
            this.renderStone();

            // 下次按键必须在运动完后才被允许，说白了就是开锁
            this.lock = true;
        }, 200);
    }

    clear() {
        for(let i = 0; i < this.maps.length; i ++) {
            for(let j = 0; j < this.maps[i].length; j ++) {
                // 清空每一个 column 的背景颜色
                this.maps[i][j].style.backgroundColor = '';
            }
        }
    }

    knockedEdge() {
        // 判断蛇头的信息是否超出地图
        if (this.snake[0].row < 0 || this.snake[0].row > 19 || this.snake[0].column < 0 || this.snake[0].column > 19) {
            return true;
        }
    }

    gameOver() {
        // 停止游戏: 清除定时器
        clearInterval(this.timer);
        console.log('%c%s', 'background-color: yellow; color: red; font-size: 50px; font-weight: bold;', ' Game Over~~ ');
    }

    bindEvent() {
        window.addEventListener('keydown', (...args) => {
            if (!this.lock) return; // 加锁了下次就不让按其他键了

            this.lock = false; // 按下键盘的时候马上“上锁”
            let kc = args[0].keyCode; // 获取键盘的 keyCode

            // 这个判断代码直播的时候没有加，当用户按下的是上下左右的时候才需要改变方向
            if (kc === 37 || kc === 38 || kc === 39 || kc === 40) {
                this.snake.changeDirection(kc);
            }
        });
    }

    randomCoordinate() {
        let row = Math.floor(Math.random() * 20);
        let column = Math.floor(Math.random() * 20);

        // 随机的食物坐标不要和蛇头重合，如果重合就重新渲染
        if (row === this.snake[0].row && column === this.snake[0].column) {
            this.randomCoordinate();
            return false;
        }
        // 随机的食物坐标不要和障碍物重合，如果重合就重新渲染
        for(let i = 0; i < this.stone.data.length; i ++) {
            if (row === this.stone.data[i].row && column === this.stone.data[i].column) {
                return this.randomCoordinate();
            }
        }
        

        this.food.row = row;
        this.food.column = column;
    }

    renderFood() {
        // 先准备地图的坐标信息，在里面找食物坐标改变颜色
        this.maps[this.food.row][this.food.column].style.backgroundColor = 'pink';
    }

    isEatedFood() {
        // 检测是否吃到食物: 判断蛇头的坐标是否和食物的坐标重合
        if (this.snake[0].row === this.food.row && this.snake[0].column === this.food.column) {
            // 吃到食物让分数增加
            this.score ++;
            this.renderScore();
            // 如果分数到达了第一关的总数
            if (this.score === this.level1Score) {
                this.gameOver();
            }
            return true;
        }
    }

    addScoreStyle() {
        this.scoreDOM = document.createElement('div');
        this.scoreDOM.className = 'score';
        // this.scoreDOM.innerHTML = '大家好';
        this.map.appendChild(this.scoreDOM);
        // 渲染分数
        this.renderScore();
    }

    renderScore() {
        this.scoreDOM.innerHTML = this.score;
    }

    renderStone() {
        // 先准备地图的坐标信息，在里面找“障碍物”坐标并改变颜色
        for(let i = 0; i < this.stone.data.length; i ++) {
            this.maps[this.stone.data[i].row][this.stone.data[i].column].style.backgroundColor = 'black';
        }
    }

    knockedStone() {
        // 判断蛇头的坐标是否和任意障碍物的坐标重合
        for(let i = 0; i < this.stone.data.length; i ++) {
            if(this.snake[0].row === this.stone.data[i].row &&  this.snake[0].column === this.stone.data[i].column) {
                return true;
            }
        }
    }
}

// 继承了 Array，为了让 Snake 的实例具备数组相关的属性和方法
class Snake extends Array{
    constructor() {
        super();
        // 蛇头坐标
        this[0] = { row: 10, column: 10 };
        // 蛇身体
        this[1] = { row: 10, column: 9 };
        this[2] = { row: 10, column: 8 };
        this.length = 3;

        this.direction = 39; // 键盘的 keyCode 39 代表右键

        this.tail = null; // 蛇尾巴
    }
    move() {
        // 第 1 步：把蛇尾干掉
        this.tail = this.pop();
        // 第 2 步：在蛇头的基础上把 column + 1
        if (this.direction === 39) {
            this.unshift({
                row: this[0].row,
                column: this[0].column + 1
            });
        } else if (this.direction === 37) {
            // 往左
            this.unshift({
                row: this[0].row,
                column: this[0].column - 1
            });
        } else if(this.direction === 40) {
            // 往下
            this.unshift({
                row: this[0].row + 1,
                column: this[0].column
            });
        } else if (this.direction === 38) {
            this.unshift({
                row: this[0].row - 1,
                column: this[0].column
            });
        }
        // 快速按下“下左键”
        // console.log(this);
    }

    changeDirection(direction) {
        // 右 39
        // 左 37
        let res = Math.abs(this.direction - direction);
        // 说明用户按下了相反的或者相同的
        if (res === 2 || res === 0) {
            return;
        }
        this.direction = direction;
    }

    growUp() {
        // 增加蛇身体
        // 把 move 的时候干掉的蛇尾巴再加上
        this.push(this.tail);
    }

    kill() {
        // “自杀”，蛇头碰到蛇身体啦
        for(let i = 1; i < this.length; i ++) {
            if (this[0].row === this[i].row && this[0].column === this[i].column) {
                return true;
            }
        }
    }
}

class Food {
    constructor(row = 0, column = 0) {
        // 存储的食物的坐标信息
        this.row = row;
        this.column = column;
    }
}

// 往地图里面增加障碍物，增加难度
class Stone {
    constructor() {
        // [ { row: 8, column: 8}, { row: 8, column: 7} ]
        // 准备障碍物的数据
        this.data = Array(5).fill().map((item, idx) => ({
            row: 8,
            column: idx + 3
        }));
        // console.log(this.data);
    }
}

new Stone()
new Game('#app', new Snake(), new Food(), new Stone());