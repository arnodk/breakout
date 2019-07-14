let player = {
    lives:3,
    outOfField:function() {
        loop.block=true;
        $("#playground").append("<div class='break-out-button' onclick='loop.block=false;$(this).remove()'>Woops. Click here.</div>");
        this.lives--;
        if (this.lives==0) {
            $("#playground").append("<div class='break-out-button' onclick='window.location.reload(true)'>Game over. Try again.</div>");
        }
    }
}

let bricks = {
    contentText:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean elit ex, pulvinar quis dolor in, mollis porta turpis. Cras accumsan fringilla fringilla. Sed lacus nulla, congue in suscipit a, dictum at augue.",
    init:function() {
        aText=this.contentText.split(' ');
        for(i=0;i<aText.length;i++) {
            $("#bricks").append('<div class="brick">'+aText[i]+'</div>');
        }
    },
    collision:function(x,y) {
        var result=false;
        $(".brick").each(function(index,value) {
            if ($(this).css("visibility")!="hidden") {

                brickx=parseInt($(this).position().left);
                bricky=parseInt($(this).position().top);

                brickx2=brickx + $(this).width() + parseInt($(this).css("padding-left")) + parseInt($(this).css("padding-right"));
                bricky2=bricky + $(this).height();

                if ((x >= brickx) && (x<=brickx2) && (y>=bricky) && (y<=bricky2))  {
                    // console.log("Brick collision");
                    $(this).css("visibility","hidden");
                    $(this).attr("hit","true");
                    if ($(".brick[hit='true']").length==$(".brick").length) {
                        alert('Well done!');
                        player.lives=0;
                    }
                    result=true;
                }

                // console.log("Brick x" + brickx);

            }
        });

        return result;
    }
};

let playground = {
    getMaxX:function() {
        return parseInt($("#playground").width());
    },
    getMaxY:function() {
        return parseInt($("#playground").height());
    },
    height:function() {
        return parseInt($("#playground").height());
    },
    width:function() {
        return parseInt($("#playground").width());
    },
    outOfField:function(x,y) {
        if (y  > playground.height()) {
            player.outOfField();

            return true;
        }
        return false;
    }
};

let bat = {
    speed:5,
    div:"#bat",
    getMaxX:function() {
        return parseInt($(this.div).width());
    },
    getXFromDiv:function() {
        return parseInt($(this.div).position().left);
    },
    getYFromDiv:function() {
        return parseInt($(this.div).position().top);
    },
    height:function() {
        return parseInt($(this.div).height());
    },
    width:function() {
        return parseInt($(this.div).width());
    },
    moveRight:function() {
        left=this.getXFromDiv();
        left=left+this.speed;
        if (left + this.width()>playground.width()) {
            this.x=playground.width() -  this.width();
        } else {
            $(this.div).css("left",left + "px");
        }
    },
    moveLeft:function() {
        left=this.getXFromDiv();
        left=left-this.speed;
        if (left<0) {
            left=0;
        }
        this.moveToX(left);
    },
    moveToX:function(x) {
        $(this.div).css("left",x + "px");
    },
    collision:function(x,y) {
        if ((bat.getXFromDiv()<=x) && (x <= bat.getXFromDiv() + bat.getMaxX()) && (y >=  playground.height() - bat.height())) {
            return true;
        }
        return false;
    }
};

let ball = {
    speed:6,
    angle:20,
    x:0,
    y:0,
    init:function() {
        this.x=this.getXFromDiv();
        this.y=this.getYFromDiv();
    },
    height:function() {
        return parseInt($("#ball").height());
    },
    move:function() {
        this.step();
        this.collisionCorrection();
        this.redraw();
    },
    getWidth:function() {
        return $("#ball").width();
    },
    getXFromDiv:function() {
        return parseInt($("#ball").position().left);
    },
    getYFromDiv:function() {
        return parseInt($("#ball").position().top);
    },
    step:function() {

        dX=Math.round(Math.sin(this.angle * (Math.PI / 180)) * this.speed);
        dY=Math.round(Math.cos(this.angle * (Math.PI / 180)) * this.speed);

        this.y=this.y+dY;
        this.x=this.x+dX;

    },
    redraw:function() {
        $("#ball").css("left",this.x + "px");
        $("#ball").css("top",this.y + "px");
    },
    collisionCorrection:function() {
        if (this.x + this.getWidth()>=playground.getMaxX()) {
            this.angle=360 - this.angle;
            this.x=playground.getMaxX() - this.getWidth();
        }

        if (this.x <= 0) {
            this.angle=360 - this.angle;
            this.x=0;
        }

        if (this.y <= 0) {
            this.angle=180 - this.angle;
            this.y=0;
        }

        if (bat.collision(this.x, this.y)) {
            // the more to the edge of the bat the collision was, the stronger an effect should be applied on the new angle of the ball.
            // but, the effect should on both sides of the bat should be opposite.
            angleModifier = this.x - bat.getXFromDiv() - (bat.width() / 2);
            this.angle=180 - Math.round(this.angle +  (angleModifier / 2));
            // this.angle=180 - this.angle;
            this.y=playground.height()-bat.height()-ball.height();
        }

        if (bricks.collision(this.x, this.y)) {
            this.angle=180 - this.angle;
            this.y = this.y - 1;
        }

        if (playground.outOfField(this.x, this.y)) {
            this.x=Math.round(playground.width() / 2);
            this.y=Math.round(playground.height() / 2);

            bat.moveToX(Math.round((playground.width() / 2) - (bat.width() / 2)));

            this.angle=0;
        }
    }
};

let controls = {
    handler:function(e) {
        switch(e.which) {
            case 37:
                bat.moveLeft();
                break;

            case 39: // right
                bat.moveRight();
                break;

            default:
                break;
        }
        e.preventDefault();
    }
};

let loop = {
    max_ticks:90000,
    ticks:0,
    block:false,
    thread:function() {
        if (!loop.block) ball.move();
        loop.ticks++;
        if ((loop.ticks<loop.max_ticks) && (player.lives>0)) {
            setTimeout(loop.thread, 50);
        }
    }
};

$(document).keydown(controls.handler);

$(document).ready(function() {
    bricks.init();
    ball.init();
    // loop.thread();
});