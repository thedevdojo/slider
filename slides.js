let sliderClasses = [
    'relative',
    'overflow-hidden',
    'h-full',
    'w-full',
    'rounded-2xl',
    'shadow-xl'
];

let slideClasses = [
    'w-full',
    'absolute',
    'h-full',
    'flex',
    'flex-col',
    'items-center',
    'justify-center',
    'bg-red-400',
    'bg-cover'
];

let sliderControlParentClass = [
    'h-full',
    'left-0',
    'top-0',
    'absolute',
    'z-50'
];

let leaveClasses = [
    // '-translate-y-full'
];

let enterStartClasses = [
    // 'translate-y-full',
    // 'mt-64',
    // '-translate-x-64',
    // 'rotate-45',
    'opacity-0'
];

let enterEndClasses = [
    'opacity-100',
];


let sliderControlsHTML = `<div class="slider-prev absolute cursor-pointer w-16 h-16 flex items-center justify-center bg-gray-100 hover:bg-white text-gray-800 rounded-full top-0 left-0 ml-5 mt-5">
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
                            </div>
                            <div class="slider-next absolute cursor-pointer w-16 h-16 flex items-center justify-center bg-gray-100 hover:bg-white text-gray-800 rounded-full bottom-0 left-0 ml-5 mb-5">
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                            </div>`;

let sliderObject = function(el){

    return {

        slides: el.querySelectorAll('[x-slide]'),
        current: 0,
        duration: 1000,
        direction: 'forward',
        isAnimating: false,

        init: function(){
            this.reorderSlideZindex(true);
        },
        next: function(){
            let nextSlide = this.getNextSlide();
            this.goToSlide(nextSlide, 'forward');
        },
        previous: function(){
            let prevSlide = this.getPrevSlide();
            this.goToSlide(prevSlide, 'backward');
        },
        goToSlide: function(slide, dir){

            if(!this.isAnimating){
                this.isAnimating = true;
                slide.classList.add(...enterStartClasses);
                slide.style.zIndex = 0;

                let that = this;
                let direction = dir;
                setTimeout(function(){
                    that.enableAnimationClasses(slide);

                    slide.classList.remove(...enterStartClasses);
                    slide.classList.add(...enterEndClasses);

                    setTimeout(function(){
                        that.disableAnimationClasses(slide);

                        // reorder and set z-index appropriately
                        if(direction == 'forward'){
                            that.slides = that.moveFirstSlideToBackInArray(that.slides);
                        } else if(direction == 'backward'){
                            that.slides = that.moveLastSlideToFrontInArray(that.slides);
                        }

                        that.reorderSlideZindex(false);
                        slide.classList.remove(...enterEndClasses);
                        that.isAnimating = false;

                    }, that.duration);
                }, 0);
            }
        },

        enableAnimationClasses: function(el){
            el.classList.add(
                'transition-all',
                'linear',
                'duration-[' + this.duration + 'ms]');
        },
        disableAnimationClasses: function(el){
            el.classList.remove(
                'transition-all',
                'linear',
                'duration-[' + this.duration + 'ms]');
        },
        reorderSlideZindex: function(setDataIndexAttribute){
            // loop through all the slides
            for(let i=0; i<this.slides.length; i++){

                if(setDataIndexAttribute){
                    // set data-index for each slide
                    this.slides[i].dataset.index = (i+1);
                }

                this.slides[i].dataset.order = (i+1);

                // set the z-index of each slide starting
                this.slides[i].style.zIndex = -(i+1);
            }
        },

        getCurrentIndex: function(){
            return this.getCurrentSlide().dataset.index;
        },
        getCurrentSlide: function(){
            return el.querySelector('[data-order="1"]');
        },
        getNextSlideIndex: function(){
            // determine the next slide
            let nextSlide = el.querySelector('[data-order="2"]');
            if( nextSlide ){
                return nextSlide.dataset.index;
            } else {
                return 1;
            }
        },
        getNextSlide: function(){
            return el.querySelector('[data-order="2"]');
        },

        getPrevSlide: function(){
            // determine the previous slide
            return el.querySelector('[data-order="' + this.slides.length + '"]');
        },

        // Reording array functions
        moveFirstSlideToBackInArray: function(array){
            let arr = [...array];
            let firstSlide = [arr[0]];
            let slidesWithoutFirstSlide = arr.slice(1, arr.length);

            return [
                ...slidesWithoutFirstSlide,
                ...firstSlide,
            ];
        },
        moveLastSlideToFrontInArray: function(array){
            let arr = [...array];
            let lastSlide = [arr[arr.length-1]];
            let slidesWithoutLastSlide = arr.slice(0, arr.length-1);

            return [
                ...lastSlide,
                ...slidesWithoutLastSlide
            ];
        }
    };
}

// Alpine Stuff
document.addEventListener('alpine:init', () => {

    // The Slider
    Alpine.directive('slider', (el, { expression }, { evaluate }) => {
        // expression === 'message'
        console.log(evaluate(expression));
        el.slider = sliderObject(el);

        // add slider classes to element
        el.classList.add(...sliderClasses);
        el.slider.init();
    });

    // Controls
    Alpine.directive('slider-controls', (el, { expression }, { evaluate }) => {
        el.innerHTML = sliderControlsHTML;
        el.classList.add(...sliderControlParentClass);

        // add next and previous click event listeners
        let nextButton = el.querySelector('.slider-next');
        nextButton.addEventListener('click', function(){
            // prevent the button from being clicked until after duration
            el.parentNode.slider.next();
        });

        let prevButton = el.querySelector('.slider-prev');
        prevButton.addEventListener('click', function(){
            // prevent the button from being clicked until after duration
            el.parentNode.slider.previous();
        });
    });

    // Slide
    Alpine.directive('slide', (el, { expression }, { evaluate }) => {
        el.classList.add(...slideClasses);
    });
});
