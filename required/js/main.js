//Aliases
var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    TextureCache = PIXI.utils.TextureCache,
    Texture = PIXI.Texture,
    Sprite = PIXI.Sprite,
    TilingSprite = PIXI.extras.TilingSprite;


var b = new Bump(PIXI);

//Create a Pixi stage and renderer and add the 
//renderer.view to the DOM
var stage = new Container(),
    renderer = autoDetectRenderer(800, 600);

document.body.appendChild(renderer.view);

loader
.add("required/assets/tiles.json")
.add("required/assets/far.png")
.add("required/assets/mid.png")
.add("required/assets/near.png")
.load(setup);

var snowflake,
farBackground,
midBackground,
nearBackground;

function setup(){

    // Load SpriteUtilities library
    let u = new SpriteUtilities(PIXI);

    // Load tileset
    let id = PIXI.loader.resources["required/assets/tiles.json"].textures;

    // Load far background image
    farBackground = new TilingSprite(TextureCache["required/assets/far.png"], renderer.view.width, renderer.view.height);
    farBackground.x = 0;
    farBackground.y = 0;
    farBackground.tileScale.x = 2;
    farBackground.tileScale.y = 2;

    // Load far background image
    midBackground = new TilingSprite(TextureCache["required/assets/mid.png"], renderer.view.width, 480);
    midBackground.x = 0;
    midBackground.y = 0;

    // Load mid background image
    nearBackground = new TilingSprite(TextureCache["required/assets/near.png"], renderer.view.width, 480);
    nearBackground.x = 0;
    nearBackground.y = renderer.view.height - 480;

    // Load player character
    let frameTextures = u.frameSeries(1, 2, "playerGrey_walk", ".png");
    snowflake = u.sprite(frameTextures);

    // Set default movement
    snowflake.movingLeft = false;
    snowflake.movingRight = false;


    // Set sprite anchor to center
    snowflake.anchor.x = 0.5;

    // Starting location
    snowflake.x = renderer.view.width / 2;
    snowflake.y = renderer.view.height - snowflake.height;

    // Starting velocity
    snowflake.vx = 0;
    snowflake.vy = 0;

    // Add acceleration and friction
    snowflake.accelerationX = 0;
    snowflake.accelerationY = 0;
    snowflake.frictionX = 1;
    snowflake.frictionY = 1;

    // Add speed and drag
    snowflake.speed = 0.2;
    snowflake.drag = 0.98

    //Capture the keyboard arrow keys
    let left = keyboard(37),
        up = keyboard(38),
        right = keyboard(39),
        down = keyboard(40);

    down.press = () => {
        snowflake.accelerationY = snowflake.speed;
        snowflake.frictionY = 1;
    }
    down.release = () => {
        if (!up.isDown){
            snowflake.accelerationY = 0;
            snowflake.frictionY = snowflake.drag;
        }
    }

    up.press = () => {
        snowflake.accelerationY = -snowflake.speed;
        snowflake.frictionY = 1;
    }
    up.release = () => {
        if (!down.isDown){
            snowflake.accelerationY = 0;
            snowflake.frictionY = snowflake.drag;
        }
    }

    left.press = () => {
        snowflake.movingLeft = true;
        snowflake.playAnimation();
        snowflake.scale.x = -1;
        snowflake.accelerationX = -snowflake.speed;
        snowflake.frictionY = 1;
    }
    left.release = () => {
        snowflake.movingLeft = false;
        scrollLeft = false;
        snowflake.stopAnimation();
        if (!right.isDown){
            snowflake.accelerationX = 0;
            snowflake.frictionX = snowflake.drag;
        }
    }

    right.press = () => {
        snowflake.movingRight = true;
        snowflake.playAnimation();
        snowflake.scale.x = 1;
        snowflake.accelerationX = snowflake.speed;
        snowflake.frictionY = 1;
    }
    right.release = () => {
        snowflake.movingRight = false;
        snowflake.stopAnimation();
        if (!left.isDown){
            snowflake.accelerationX = 0;
            snowflake.frictionX = snowflake.drag;
        }
    }

    stage.addChild(farBackground);
    stage.addChild(midBackground);
    stage.addChild(nearBackground);
    stage.addChild(snowflake);

    state = play;

    //Start the game loop
    gameLoop();
}

function gameLoop(){
    requestAnimationFrame(gameLoop);
    state();
    renderer.render(stage);
}

function play(){
    snowflake.vx += snowflake.accelerationX;
    snowflake.vy += snowflake.accelerationY;

    snowflake.vx *= snowflake.frictionX;
    snowflake.vy *= snowflake.frictionY;

    // Gravity
    snowflake.vy += 0.1;

    // Keep sprite in render area
    let collision = b.contain(
        snowflake,
        {
            x: 0,
            y: 0,
            width: renderer.view.width,
            height: renderer.view.height
        }
    );

    if (collision){
        if (collision.has("left") || collision.has("right")){
            if (snowflake.vx > 1.5){
                snowflake.vx = -snowflake.vx / 2;
            }else{
                snowflake.vx = 0;
            }
        }

        if (collision.has("top") || collision.has("bottom")){
            if (snowflake.vy >= 1.5){
                snowflake.vy = -snowflake.vy / 2;
            }else{
                snowflake.vy = 0;
            }
        }
    }

    // Scroll and nuke momentum if near edge of stage
    if (snowflake.x < 100 && snowflake.movingLeft){
        scrollLeft = true;
        midBackground.tilePosition.x += snowflake.speed * 10;
        nearBackground.tilePosition.x += snowflake.speed * 5;
        snowflake.vx = 0;
    }else{
        scrollLeft = false;
    }
    if (snowflake.x > renderer.view.width - 100 && snowflake.movingRight){
        scrollRight = true;
        snowflake.vx = 0;
        midBackground.tilePosition.x -= snowflake.speed * 10;
        nearBackground.tilePosition.x -= snowflake.speed * 5;
    }else{
        scrollRight = false;
    }

    snowflake.x += snowflake.vx;
    snowflake.y += snowflake.vy;
}
