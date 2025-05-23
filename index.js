const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField } = require("discord.js");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const patchBotId = "1364735752704888855"; // ID de PatchBot

client.once("ready", () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.id !== patchBotId) return;

  console.log(`Mensaje de PatchBot (${message.author.id})`);
  console.log(`Número de embeds: ${message.embeds.length}`);

  if (message.embeds.length > 0) {
    const keywords = ["Price:", "Free until:", "Supported Platforms:", "Release Date:"];
    const traducciones = {
      "Price:": "Precio:",
      "Free until:": "Gratis hasta:",
      "Supported Platforms:": "Plataformas soportadas:",
      "Release Date:": "Lanzamiento:",
      "All Reviews:": "Reseñas:"
    };
    let reenviados = 0;

    for (const originalEmbed of message.embeds) {
      const matches = originalEmbed.fields.reduce((count, field) => {
        return count + (keywords.includes(field.name) ? 1 : 0);
      }, 0);

      if (matches >= 2) {
        // Traducir los campos
        const camposTraducidos = originalEmbed.fields.map(field => {
          const nombreTraducido = traducciones[field.name] || field.name;
          return {
            name: nombreTraducido,
            value: field.value,
            inline: field.inline
          };
        });

        const embed = new EmbedBuilder()
          .setColor(originalEmbed.color || 0x0099ff)
          .setTitle(originalEmbed.title || null)
          .setURL(originalEmbed.url || null)
          .setDescription(originalEmbed.description || null)
          .setImage(originalEmbed.image?.url || null)
          .setThumbnail(originalEmbed.thumbnail?.url || null)
          .setAuthor(originalEmbed.author ? {
            name: originalEmbed.author.name,
            iconURL: originalEmbed.author.iconURL,
            url: originalEmbed.author.url,
          } : null)
          .setFooter(originalEmbed.footer ? {
            text: originalEmbed.footer.text,
            iconURL: originalEmbed.footer.iconURL,
          } : null)
          .setTimestamp(originalEmbed.timestamp || null)
          .setFields(camposTraducidos);

        // Verificar si el bot tiene permiso para mencionar a everyone
        const botMember = await message.guild.members.fetch(client.user.id);
        const canMentionEveryone = botMember.permissions.has(PermissionsBitField.Flags.MentionEveryone);

        if (canMentionEveryone) {
          await message.channel.send({ content: "@everyone", embeds: [embed] });
          console.log("✅ Embed reenviado con @everyone");
        } else {
          await message.channel.send({ embeds: [embed] });
          console.log("⚠️ No se tiene permiso para mencionar a @everyone, solo se envió el embed.");
        }

        reenviados++;
      }
    }

    if (reenviados > 0) {
      await message.delete();
      console.log(`✅ Mensaje original borrado tras reenviar ${reenviados} embed(s).`);
    } else {
      console.log("❌ Ningún embed parecía juego. No se borra el mensaje.");
    }
  }
});

client.login(process.env.TOKEN);


const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot activo 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Servidor web activo en el puerto ${PORT}`);
});

