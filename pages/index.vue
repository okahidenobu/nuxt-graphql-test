<template>
  <div>
    <h3>link.description list from node gql server</h3>
    <!--    <ul v-if="feed">-->
    <ul>
      <li v-for="item in feed" :key="item.id">
        {{ item.description }}
        <!--        <button @click="deletePost">delete</button>-->
      </li>
    </ul>
    <!--    <pre>{{ feed }}</pre>-->
    <form @click.prevent>
      description :
      <input type="text" v-model="description" />
      <button @click="post">post</button>
    </form>
  </div>
</template>

<script>
import getLinks from "~/apollo/queries/getLinks.graphql";
import updateLink from "~/apollo/mutations/updateLink.graphql";
import newLink from "~/apollo/subscriptions/newLink.graphql";

export default {
  data() {
    return {
      feed: [],
      url: "",
      description: ""
    };
  },

  apollo: {
    feed: {
      //queryでデータを取得している部分
      query: getLinks,

      //subscriptionsの実装部分
      subscribeToMore: {
        //subscriptionのクエリ
        document: newLink,
        // 元のデータを更新する処理
        updateQuery: (previousResult, { subscriptionData }) => {
          if (!subscriptionData.data) {
            return previousResult;
          }
          const newLink = subscriptionData.data.newLink;
          // ここで更新されたデータが元のデータに代入される
          return previousResult.feed.push(newLink);
        }
      }
    }
  },
  methods: {
    //mutationで新しいデータを作成する処理
    async post() {
      // We save the user input in case of an error これはなくてもいいのか？
      const description = this.description;
      // We clear it early to give the UI a snappy feel これもなくてもいいのか？
      this.description = "";

      //mutation実行処理
      await this.$apollo.mutate({
        //クエリ
        mutation: updateLink,
        //変数
        variables: {
          description: description
        }
      });
    },

    deletePost() {}
  }
};
</script>
