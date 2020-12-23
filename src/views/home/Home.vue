<template>
    <div id="home" class="wrapper">
      <nav-bar class="home-nav"><div slot="center">购物街</div></nav-bar>
      <tab-control ref="tabControl1"
                   :class="{fixed: isTabFixed}"
                   :titles="['流行', '新款', '精选']"
                   @tabClick="tabClick"
                   class="tab-control" v-show="isTabFixed" />
      <scroll class="content"
              ref="scroll"
              :probe-type="3"
              @scroll="contentScroll"
              :pull-up-load="true"
              @pullingUp="loadMore">
        <home-swiper :banners="banners" @swiperImageLoad="swiperImageLoad"/>
        <recommend-view :recommends="recommends" />
        <feature-view />
        <tab-control ref="tabControl2"
                     :class="{fixed: isTabFixed}"
                     :titles="['流行', '新款', '精选']"
                     @tabClick="tabClick" />
        <goods-list :goods="showGoods" />
      </scroll>

      <back-top @click.native="backClick" v-show="isShowBackTop"/>
      <!--<back-top @backTop="backClick" v-show="isShowBackTop"/>-->

    </div>
</template>

<script>
  import HomeSwiper from "./childComps/HomeSwiper";
  import RecommendView from "./childComps/RecommendView";
  import FeatureView from "./childComps/FeatureView";

  import NavBar from "components/common/navbar/NavBar";
  import TabControl from "components/content/tabControl/TabControl";
  import GoodsList from "components/content/goods/GoodsList";
  import Scroll from "components/common/scroll/Scroll";
  import BackTop from "components/content/backTop/BackTop";

  import { getHomeMultidata, getHomeGoods } from "network/home";
  import {debounce} from "common/utils";

  export default {
      name: "Home",
      components: {
        HomeSwiper,
        RecommendView,
        FeatureView,
        NavBar,
        TabControl,
        GoodsList,
        Scroll,
        BackTop
      },
    data() {
        return {
          banners: [],
          recommends: [],
          goods: {
            'pop': {page: 0, list: []},
            'new': {page: 0, list: []},
            'sell': {page: 0, list: []},
          },
          currentType: 'pop',
          isShowBackTop: false,
          tabOffsetTop: 0,
          isTabFixed: false,
          saveY: 0
        }
    },
    computed: {
      showGoods() {
        return this.goods[this.currentType].list;
      }
    },
    destroyed() {
      console.log('home destroyed');
    },
    activated() {
      this.$refs.scroll.scrollTo(0, this.saveY, 0)
      this.$refs.scroll.refresh()
    },
    deactivated() {
      this.saveY = this.$refs.scroll.getScrollY()
    },
    created() {
      // 1.请求多个数据
      this.getHomeMultidata()

      // 2.请求商品数据
      this.getHomeGoods('pop')
      this.getHomeGoods('new')
      this.getHomeGoods('sell')

      /*// 3.监听item中图片加载完成
      this.$bus.$on('itemImageLoad', () => {
        // console.log('aaa');
        this.$refs.scroll.refresh()
      })*/
    },
    mounted() {
      // 1.图片加载完成的事件监听
      const refresh = debounce(this.$refs.scroll.refresh, 500)
      this.$bus.$on('itemImageLoad', () => {
        refresh()
      })
    },
    methods: {
        /*
        * 事件监听相关的方法
        */
        tabClick(index) {
          switch (index) {
            case 0:
              this.currentType = 'pop';
              break
            case 1:
              this.currentType = 'new';
              break
            case 2:
              this.currentType = 'sell';
              break
          }
          this.$refs.tabControl1.currentIndex = index;
          this.$refs.tabControl2.currentIndex = index;
        },
        backClick() {
          this.$refs.scroll.scrollTo(0, 0, 500)
        },
        contentScroll(position) {
          // 1.决定backTop是否显示
          this.isShowBackTop = (-position.y) > 1000

          // 2.决定tabControl是否吸顶(position: fixed)
          this.isTabFixed = (-position.y) > this.tabOffsetTop;
        },
        loadMore() {
          // console.log('上拉加载更多');
          this.getHomeGoods(this.currentType)
        },
        swiperImageLoad() {
          // 2.获取tabControl的offsetTop
          // 所有的组件都有一个属性$el：用于获取组件中的元素
          this.tabOffsetTop = this.$refs.tabControl2.$el.offsetTop;
        },

        /*
        * 网络请求相关的方法
        */
        getHomeMultidata() {
          getHomeMultidata().then(res => {
            // this.result = res;
            this.banners = res.data.banner.list;
            this.recommends = res.data.recommend.list;
          })
        },
        getHomeGoods(type) {
          const page = this.goods[type].page + 1;
          getHomeGoods(type,page).then(res => {
            this.goods[type].list.push(...res.data.list);
            this.goods[type].page += 1;

            //完成上拉加载更多
            this.$refs.scroll.finishPullUp()
          })
        }
    }
  }
</script>

<style scoped>
  #home {
    /*padding-top: 44px;*/
    height: 100vh;
    position: relative;
  }
  .home-nav {
    background-color: var(--color-tint);
    color: #fff;

    /*在使用浏览器原生滚动时，为了让导航不跟随一起滚动*/
    /*position: fixed;
    left: 0;
    right: 0;
    top: 0;
    z-index: 9;*/
  }
  .tab-control {
    /*position: sticky;
    top: 43px;
    z-index: 9;*/
    position: relative;
    z-index: 9;
  }

  .content {
    overflow: hidden;
    position: absolute;
    top: 44px;
    bottom: 49px;
    left: 0;
    right: 0;

    /*height: calc(100% - 93px);
    overflow: hidden;
    margin-top: 43px;*/
  }

  .fixed {
    position: fixed;
    left: 0;
    right: 0;
    top: 44px;
  }

</style>
