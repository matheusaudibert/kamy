const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, Collection } = require("discord.js");
const { getUserData } = require("../services/apiService");
const { allBadges, allStatus, allConnections } = require("../constants/emojis");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Generates a user profile")
    .addUserOption((option) =>
      option.setName("user").setDescription("User").setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const userId = user.id;

    const loadingEmbed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("<a:loading:1315688972000821279> Generating profile");

    await interaction.reply({ content: null, embeds: [loadingEmbed] });

    try {
      const data = await getUserData(userId);
      const profile = data.profile;
      const badges = (profile.badges || [])
        .map((badge) => allBadges[badge.id] || "")
        .filter(Boolean)
        .join("");
      const connectedAccounts = profile.connected_accounts;
      const status = data.status;
      const spotify = data.spotify;
      const activity = data.activity;

      const statusEmoji = allStatus[status];

      if (profile.display_name === undefined) {
        profile.display_name = profile.username;
      }

      const title = `${statusEmoji} ${profile.display_name} ${badges}`;

      if (title.length > 256) {
        const errorEmbed = new EmbedBuilder()
          .setColor("#2b2d31")
          .setDescription(
            "<:report_message:1315835980237897768> The profile exceeds the character limit for the embed."
          );

        await interaction.editReply({ content: null, embeds: [errorEmbed] });
        setTimeout(async () => {
          try {
            await interaction.deleteReply();
          } catch (error) {}
        }, 8000);
        return;
      }

      bio = profile.bio || " ";
      bio = bio.replace(/:[a-zA-Z0-9_]+:/g, "");
      bio = bio.replace(/<[^>]+>/g, "");

      const connectionFields = connectedAccounts.map((account) => {
        const emoji = allConnections[account.type] || "";
        return {
          name: `${emoji} ${account.name} <:verified:1315683226416582737>`,
          value: "ㅤ",
          inline: true,
        };
      });

      if (connectedAccounts.length > 0) {
        field = `${profile.member_since}\n\n**Connections**`;
      } else {
        field = `${profile.member_since}`;
      }

      const avatarUrl = profile.avatar_image;

      const embed1 = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle(title)
        .setDescription(bio)
        .setAuthor({ name: profile.username, url: profile.link })
        .addFields({ name: "Member since", value: field }, ...connectionFields)
        .setThumbnail(avatarUrl);

      let embed2 = null;
      if (spotify && spotify.type === "Listening to Spotify") {
        embed2 = new EmbedBuilder()
          .setTitle(`${spotify.song}`)
          .setDescription(`${spotify.artist}\n-# ${spotify.album}`)
          .setURL(spotify.link)
          .setColor("#2b2d31")
          .setAuthor({
            name: "Listening to Spotify",
            url: "https://open.spotify.com",
            iconURL: "https://m.media-amazon.com/images/I/51rttY7a+9L.png",
          })
          .setThumbnail(spotify.album_image);
      }

      const activityEmbeds = [];
      if (activity && activity.length > 0) {
        for (const act of activity) {
          const state = act.state || "";
          const details = act.details || "";
          const timeLapsed = act.timestamps
            ? act.timestamps.time_lapsed || ""
            : "";

          let description = `${details}\n${state}`;
          if (timeLapsed) {
            description += `\n-# **${timeLapsed}**`;
          }

          if (act.largeImage === "https://ibb.co/yF7QFQY6") {
            act.largeImage = null;
          }

          const embed = new EmbedBuilder()
            .setTitle(`${act.name}`)
            .setDescription(description)
            .setColor("#2b2d31")
            .setAuthor({
              name: "Playing",
              iconURL: act.smallImage,
            })
            .setThumbnail(act.largeImage);

          activityEmbeds.push(embed);
        }
      }

      const embedsToSend = [embed1];
      if (embed2) {
        embedsToSend.push(embed2);
      }
      if (activityEmbeds.length > 0) {
        embedsToSend.push(...activityEmbeds);
      }

      const lastEmbed = embedsToSend[embedsToSend.length - 1];
      lastEmbed.setFooter({
        text: "powered by audibert",
        iconURL:
          "https://cdn.discordapp.com/attachments/1315442171549188127/1315522821149036564/boticon.png",
      });

      try {
        await interaction.editReply({ content: null, embeds: embedsToSend });
      } catch (error) {}
    } catch (error) {
      if (error.response && error.response.status === 500) {
        const errorEmbed = new EmbedBuilder()
          .setColor("#2b2d31")
          .setDescription(
            "<:report_message:1315835980237897768> User is not being monitored by audibert\nTo be monitored join https://discord.gg/QaHyQz34Gq"
          );

        await interaction.editReply({ content: null, embeds: [errorEmbed] });
        setTimeout(async () => {
          try {
            await interaction.deleteReply();
          } catch (error) {}
        }, 8000);
        return;
      } else {
        console.log(error);
        const errorEmbed = new EmbedBuilder()
          .setColor("#2b2d31")
          .setDescription(
            "<:report_message:1315835980237897768> An error occurred while fetching data from the API."
          );
        await interaction.editReply({ content: null, embeds: [errorEmbed] });
        setTimeout(async () => {
          try {
            await interaction.deleteReply();
          } catch (error) {}
        }, 8000);
      }
    }
  },
};
