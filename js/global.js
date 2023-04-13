// --------------add active class-on another-page move----------
jQuery(document).ready(function ($) {
    setTimeout(() => {
        $('.splash').fadeOut();
    }, 5000);
    // Get current path and find target link
    var path = window.location.pathname.split("/").pop();

    // Account for home page with empty path
    if (path == '') {
        path = 'index.html';
    }

    var target = $('#navbarSupportedContent ul li a[href="' + path + '"]');
    // Add active class to target link
    target.parent().addClass('active');
});


Vue.config.devtools = true;

Vue.component('card', {
    template: `
<div class="card-wrap"
@mousemove="handleMouseMove"
@mouseenter="handleMouseEnter"
@mouseleave="handleMouseLeave"
ref="card">
<div class="card"
  :style="cardStyle">
  <div class="card-bg" :style="[cardBgTransform, cardBgImage]"></div>
  <div class="card-info">
    <slot name="header"></slot>
    <slot name="content"></slot>
  </div>
</div>
</div>`,
    mounted() {
        this.width = this.$refs.card.offsetWidth;
        this.height = this.$refs.card.offsetHeight;
    },
    props: ['dataImage'],
    data: () => ({
        width: 0,
        height: 0,
        mouseX: 0,
        mouseY: 0,
        mouseLeaveDelay: null
    }),
    computed: {
        mousePX() {
            return this.mouseX / this.width;
        },
        mousePY() {
            return this.mouseY / this.height;
        },
        cardStyle() {
            const rX = this.mousePX * 5;
            const rY = this.mousePY * -5;
            return {
                transform: `rotateY(${rX}deg) rotateX(${rY}deg)`

            };
        },
        cardBgTransform() {
            const tX = this.mousePX * -40;
            const tY = this.mousePY * -40;
            return {
                //transform: `translateX(${tX}px) translateY(${tY}px)`
            }
        },
        cardBgImage() {
            return {
                backgroundImage: `url(${this.dataImage})`
            }
        }
    },
    methods: {
        handleMouseMove(e) {
            this.mouseX = e.pageX - this.$refs.card.offsetLeft - this.width / 2;
            this.mouseY = e.pageY - this.$refs.card.offsetTop - this.height / 2;
        },
        handleMouseEnter() {
            clearTimeout(this.mouseLeaveDelay);
        },
        handleMouseLeave() {
            this.mouseLeaveDelay = setTimeout(() => {
                this.mouseX = 0;
                this.mouseY = 0;
            }, 100);
        }
    }
});

const app = new Vue({
    el: '#app'
});
VanillaTilt.init(document.querySelectorAll(".card"), {
    glare: true,
    reverse: true,
    "max-glare": 0.15
});
// VanillaTilt.init(document.querySelectorAll(".karte"), {
//     glare: true,
//     reverse: true,
//     "max-glare": 0.25
// });