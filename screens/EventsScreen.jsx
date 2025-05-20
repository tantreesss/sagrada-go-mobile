import React, { useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import EventCard from '../components/EventCard';
import { globalStyles } from '../styles/globalStyles';

const mockEvents = [
  {
    id: '1',
    title: 'Ash Wednesday',
    date: '2025-03-05',
    image: 'https://scontent.fmnl25-3.fna.fbcdn.net/v/t39.30808-6/476908364_630844646006058_3923690413383957528_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGzIlg1U7XdrbnxDfn1Gbp-uH1e7_WzKWK4fV7v9bMpYo7I6lCu7PX5y1ete55131oz2C7IQ1AiYGh5fUXGDbuq&_nc_ohc=2el6AlbSyCMQ7kNvgGAIIMe&_nc_oc=AdgVntI7ixJ-jS-2ZWn2sBxk_Tn6lcXULAhHlrLkEzknlws5mOWKHig9eqaFOzYyszg&_nc_zt=23&_nc_ht=scontent.fmnl25-3.fna&_nc_gid=AiA8aHYrENlkWg6xf_KUmsI&oh=00_AYBQgUVU_mNKq5N1VYMHYy6cmUIGySEqQ4bDOkF9Oyp4Rg&oe=67C37392',
  },
  {
    id: '2',
    title: 'Palm Sunday',
    date: '2025-04-13',
    image: 'https://scontent.fmnl25-3.fna.fbcdn.net/v/t39.30808-6/476797265_630867542670435_4209149265670948886_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeFPTGgpTv-_s2g5sLlXbYUe7izL_fBAZ9zuLMv98EBn3JtmgomxL9n6_wgz9i2fnV69jHxXmQv2JIP-jdKtedgu&_nc_ohc=v_n-KEFL8R8Q7kNvgFyKzjV&_nc_oc=AdiX4qo_v-EQsQhU3dnk_LO4hq28A4ut2sxvPvZAQCDzFumW3K-V5bBw9iEK0dTl-64&_nc_zt=23&_nc_ht=scontent.fmnl25-3.fna&_nc_gid=A16Wssbch93xmZ9nsZAL4J2&oh=00_AYCiYL2jhemsUGQz7kCDNVFqDPyOH4-K5IqWq-s6aOkHIg&oe=67C354B7',
  },
  {
    id: '3',
    title: 'Barrio Fiesta',
    date: '2025-11-17',
    image: 'https://scontent.fmnl25-6.fna.fbcdn.net/v/t39.30808-6/480183157_634440645646458_6842524422907080943_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeGDqeeyyjSNhK45ceHSiq14SVRTir1T97VJVFOKvVP3taDFTIl0vGhrfFZKoKhlM2GwCTCfta6wws_xHt9zvLGp&_nc_ohc=mUs_s8nbraYQ7kNvgE-qH7m&_nc_oc=AdhuOS18BP_fi2lKwLC-JLAlRkQ7a7R2LWxWyBSp0-dv0D0hLaJ1MrLC4gk4YAozat0&_nc_zt=23&_nc_ht=scontent.fmnl25-6.fna&_nc_gid=AYQohGGPlH33s402UC6JEOr&oh=00_AYBOCXX1G349aHNGZ-hN0jGm_-qxSHHombyvOVLFyKKe7w&oe=67C36351',
  },
  {
    id: '4',
    title: 'Sacerdotal Anniversary',
    date: '2025-11-22',
    image: 'https://scontent.fmnl25-1.fna.fbcdn.net/v/t39.30808-6/480606090_638951758528680_3306634313984973890_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEDHiZZUGlLjkyXeN7-Rswe9ixM6Piv97L2LEzo-K_3sot2v5iZ_CoElAjsBAxF9ENO4wE9zvQ2Z_OfOH7VDhLh&_nc_ohc=ddFLbAdMpd0Q7kNvgHePTr8&_nc_oc=AdjIXVevYm5FOS4fumYo-2nK74U0ejUjkpLFzUhAgYDfJ1cOMOGke86wNPiC3fCWGro&_nc_zt=23&_nc_ht=scontent.fmnl25-1.fna&_nc_gid=AgfcNxcBt39KHhvc_dTa-bH&oh=00_AYAQ4pDcLsQS0lCX8hCK-L0PkGxgGjsfZMzRumZvNXlRzw&oe=67C378AB',
  },
];

export default function EventsScreen() {
  const [events] = useState(mockEvents);

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Upcoming Events</Text>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventCard event={item} />}
        removeClippedSubviews={false}  // Ensures images load properly
      />
    </View>
  );
}
