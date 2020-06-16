<template>
  <div>
    <ul>
      <li v-for="item in getUsers" :key="item.id">
        {{ item.firstName }}
        <button @click="deleteUser(item.id)">delete</button>
        <button @click="updateUser(item.id, 'updated', '')">update</button>
      </li>
    </ul>
    <form @click.prevent>
      name :
      <input type="text" v-model="firstName" />
      <button @click="addUser">post</button>
    </form>
  </div>
</template>

<script>
import fetchUsers from "~/apollo/queries/getUsers.graphql";
import addUser from "~/apollo/mutations/addUser.graphql";
import deleteUser from "~/apollo/mutations/deleteUser.graphql";
import updateUser from "~/apollo/mutations/updateUser.graphql";
import userAdded from "~/apollo/subscriptions/userAdded.graphql";
import userUpdated from "~/apollo/subscriptions/userUpdated.graphql";
import userDeleted from "~/apollo/subscriptions/userDeleted.graphql";

export default {
  data() {
    return {
      user: [],
      firstName: "",
      lastName: ""
    };
  },

  apollo: {
    getUsers: {
      //queryでデータを取得している部分
      query: fetchUsers,

      //subscriptionsの実装部分
      subscribeToMore: [
        {
          //subscriptionのクエリ
          document: userAdded,
          // 元のデータを更新する処理
          updateQuery: (previousResult, { subscriptionData }) => {
            if (!subscriptionData.data) {
              return previousResult;
            }
            return {
              getUsers: [
                ...previousResult.getUsers,
                subscriptionData.data.userAdded
              ]
            };
          }
        },
        {
          //subscriptionのクエリ
          document: userUpdated,
          // 元のデータを更新する処理
          updateQuery: (previousResult, { subscriptionData }) => {
            if (!subscriptionData.data) {
              return previousResult;
            }
            const userUpdated = subscriptionData.data.userUpdated;
            const targetUser = previousResult.getUsers.find(
              link => link.id + "" === userUpdated.id + ""
            );
            targetUser.firstName = userUpdated.firstName;
            return previousResult.getUsers;
          }
        },
        {
          document: userDeleted,
          updateQuery: (prev, { subscriptionData }) => {
            if (!subscriptionData.data) {
              return prev;
            }

            const userDeleted = subscriptionData.data.userDeleted;
            const linkIndex = prev.getUsers.findIndex(
              link => link.id + "" === userDeleted.id + ""
            );

            prev.getUsers.splice(linkIndex, 1);
            return prev.getUsers;
          }
        }
      ]
    }
  },
  methods: {
    //mutationで新しいデータを作成する処理
    async addUser() {
      // We save the user input in case of an error これはなくてもいいのか？
      const firstName = this.firstName;
      // We clear it early to give the UI a snappy feel これもなくてもいいのか？
      this.firstName = "";

      //mutation実行処理
      await this.$apollo.mutate({
        //クエリ
        mutation: addUser,
        //変数
        variables: {
          firstName: firstName
        }
      });
    },

    async updateUser(id, firstName, lastName) {
      //mutation実行処理
      await this.$apollo.mutate({
        //クエリ
        mutation: updateUser,
        //変数
        variables: {
          id: id,
          firstName: firstName,
          lastName: lastName
        }
      });
    },
    async deleteUser(id) {
      //mutation実行処理
      await this.$apollo.mutate({
        //クエリ
        mutation: deleteUser,
        //変数
        variables: {
          id: id
        }
      });
    }
  }
};
</script>
