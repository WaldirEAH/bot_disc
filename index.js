const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField } = require("discord.js");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const patchBotId = "1364735752704888855";
const traducciones = {
  "Price:": "Precio:",
  "Free until:": "Gratis hasta:",
  "Supported Platforms:": "Plataformas soportadas:",
  "Release Date:": "Lanzamiento:",
  "All Reviews:": "Reseñas:",
};
const keywords = Object.keys(traducciones);

client.once("ready", () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

function traducirCampos(fields) {
  return fields.map((field) => ({
    name: traducciones[field.name] || field.name,
    value: field.value,
    inline: field.inline,
  }));
}

function crearEmbed(originalEmbed, camposTraducidos) {
  return new EmbedBuilder()
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
}

async function enviarEmbed(message, embed) {
  try {
    const botMember = await message.guild.members.fetch(client.user.id);
    const canMentionEveryone = botMember.permissions.has(PermissionsBitField.Flags.MentionEveryone);
    const content = canMentionEveryone ? "@everyone" : undefined;
    await message.channel.send({ content, embeds: [embed] });
    console.log(`✅ Embed enviado ${canMentionEveryone ? "con @everyone" : "sin @everyone"} [Mensaje ID: ${message.id}]`);
    return true;
  } catch (err) {
    console.error(`❌ Error al enviar embed [Mensaje ID: ${message.id}]: ${err.message}`);
    return false;
  }
}

async function procesarEmbed(message, originalEmbed) {
  const matches = originalEmbed.fields.reduce((count, field) => count + (keywords.includes(field.name) ? 1 : 0), 0);
  console.log(`🧩 Campos relevantes encontrados: ${matches} [Mensaje ID: ${message.id}]`);

  if (matches >= 2) {
    const camposTraducidos = traducirCampos(originalEmbed.fields);
    const embed = crearEmbed(originalEmbed, camposTraducidos);
    console.log(`📤 Preparando embed traducido [Mensaje ID: ${message.id}]`);
    return await enviarEmbed(message, embed);
  } else {
    console.log(`🚫 Embed ignorado: no contiene suficientes campos relevantes [Mensaje ID: ${message.id}]`);
    return false;
  }
}

client.on("messageCreate", async (message) => {
  if (message.author.id !== patchBotId) return;

  console.log(`🟡 Mensaje detectado de PatchBot [ID: ${message.id}, Contenido: "${message.content}", Embeds: ${message.embeds.length}]`);

  if (message.embeds.length > 0) {
    let reenviados = 0;
    for (const originalEmbed of message.embeds) {
      console.log(`🔍 Procesando embed [Mensaje ID: ${message.id}]`);
      if (await procesarEmbed(message, originalEmbed)) {
        reenviados++;
      }
    }

    if (reenviados > 0) {
      try {
        await message.delete();
        console.log(`🗑️ Mensaje original borrado tras reenviar ${reenviados} embed(s) [Mensaje ID: ${message.id}]`);
      } catch (err) {
        console.error(`❌ Error al borrar mensaje [Mensaje ID: ${message.id}]: ${err.message}`);
      }
    } else {
      console.log(`❌ Ningún embed parecía juego. No se borra el mensaje [Mensaje ID: ${message.id}]`);
    }
  }
});

client.login(process.env.TOKEN);

// Servidor web
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot activo 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Servidor web activo en el puerto ${PORT}`);
});

