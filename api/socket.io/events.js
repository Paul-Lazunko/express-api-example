import { User } from '../models/User';

const enableEvents = ( socket, io ) => {

  //TODO: events list implementation if it will be needed

  socket.on('typing', ( data ) => {

    if ( data.channel ) {

      io.to( data.channel ).emit('typing', { user: socket.user, channel: data.channel, status: data.status });

    }

  });

  socket.on('channelStatus', (data) => {

    if ( data.channel ) {

      io.to( data.channel ).emit('joinChannel', { user: socket.user, channel: data.channel, status: data.status });

    }

  });


  socket.on('disconnect', async () => {

    try {

      if ( socket.user ) {

        await User.update({ _id: socket.user._id }, { isOnline: false });

        io.emit('userOffline', { user: socket.user });

      }

    } catch ( error ) {

      console.log(error);

    }

  })

};


export { enableEvents };
