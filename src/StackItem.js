import React from "react";
import { View } from "@react-easy-ui/core-components";

const StackItem = (props) => {
  const {
    screen: Component,
    ScreenComponent,
    navigation,
    activeMQ,
    index,
  } = props;
  let children = (
    <Component activeMQ={activeMQ} index={index} navigation={navigation} />
  );
  if (ScreenComponent) {
    children = (
      <ScreenComponent
        activeMQ={activeMQ}
        index={index}
        navigation={navigation}
      >
        {children}
      </ScreenComponent>
    );
  }
  return (
    <View style={{ position: "absolute", width: "100%", height: "100%" }}>
      {children}
    </View>
  );
};

export { StackItem };
