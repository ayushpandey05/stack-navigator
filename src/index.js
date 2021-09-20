import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  BackHandler,
  Platform,
  Dimensions,
} from "@react-easy-ui/core-components";
import { StackItem } from "./StackItem";
import { createUniqueId, getActiveMQ } from "@react-easy-ui/utility-functions";

const getErrorView = ({ view, onPress }) => {
  return () => {
    return (
      <TouchableOpacity onPress={onPress}>
        <Text>View not found [{view}]. [Close] </Text>
      </TouchableOpacity>
    );
  };
};

const ErrorScreen = (props) => {
  const { navigation, view } = props || {};
  return (
    <TouchableOpacity onPress={navigation?.goBack}>
      <Text>View not found [{view}]. [Close] </Text>
    </TouchableOpacity>
  );
};

const getViewStyle = ({ activeMQ, expanded, index, viewLength = 1 }) => {
  if (activeMQ === "xs" || activeMQ === "sm" || viewLength === 1) {
    return {
      display: "flex",
      position: "absolute",
      width: "100%",
      height: "100%",
    };
  }
  if (viewLength - 2 === index) {
    if (expanded) {
      return { width: "100%", display: "flex", flexShrink: 0 };
    }
    return { display: "flex", flex: 1, flexShrink: void 0 };
  }
  if (viewLength - 1 === index) {
    if (expanded) {
      return { width: "100%", display: "flex", flexShrink: 0 };
    }
    return { display: "flex", width: "70%", flexShrink: void 0 };
  }
  return { display: "none" };
};

class Stack extends React.Component {
  constructor(props) {
    super(props);
    this.stackUniqueName = createUniqueId();
    let { routes } = props;
    this.routes = { ...routes };
    let views = [
      this.getRoute(Object.keys(this.routes)[0], { name: "Ayush Pandey" }, 0),
    ];
    const width = Dimensions.get("window").width;
    this.state = { views, activeMQ: getActiveMQ(width) };
  }

  setScreenSize = () => {
    const width = Dimensions.get("window").width;
    const activeMQ = getActiveMQ(width);
    this.setState({ activeMQ });
  };
  componentDidMount() {
    Dimensions.addEventListener("change", this.setScreenSize);
    this.backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      Platform.OS === "web" ? this.props.handleBack : this.handleBackPress
    );
  }

  componentWillUnmount() {
    Dimensions.removeEventListener("change");
    this.backHandler && this.backHandler.remove();
  }

  handleBackPress = () => {
    let { backPressTime = 3000, showBackPressMessage } = this.props;
    const { views } = this.state;
    if (this.pop(0, views?.length - 1)) {
      return true;
    }
    if (
      this.lastBackPressTime &&
      new Date() - this.lastBackPressTime < backPressTime
    ) {
      return false;
    }
    this.lastBackPressTime = new Date();
    showBackPressMessage && showBackPressMessage();
    return true;
  };
  getRoute = (routeName, params, index) => {
    let registeredRoute = this.routes[routeName]
      ? routeName
      : "route-not-found";

    let route = {
      view: registeredRoute,
      params,
      navigation: this.getNavigation({ index }),
      screenState: {},
      //   setScreenState: this.getScreenStateSetter({ index }),
    };
    return route;
  };

  onRouteChange = (replace) => {
    const { onRouteChange } = this.props;
    if (typeof onRouteChange === "function") {
      const { views } = this.state;
      console.log("@@@@state!!>>>>>>>", views);
      const { view, params } = views[views.length - 1];
      onRouteChange({ view, params }, replace);
    }
  };

  push = (route = {}, index) => {
    const { views = [] } = this.state;
    if (views[index].screenState.expanded) {
      views[index].screenState.expanded = false;
    }
    views[index + 1] = this.getRoute(route.view, route.params, index + 1);
    this.setState({ views }, this.onRouteChange);
  };
  replace = (route = {}, index) => {
    const { views = [] } = this.state;
    views[index] = this.getRoute(route.view, route.params, index);
    this.setState({ views }, this.onRouteChange);
  };
  reset = (route = {}, index) => {
    this.setState(
      { views: [{ view: route.view, params: route.params }] },
      () => {
        this.onRouteChange(true);
      }
    );
  };
  // pop = (count = 0, index = 0) => {
  //   const { views } = this.state;
  //   let isPop = false;
  //   let newViews = [];
  //   if (index - count + 1 > views.length) {
  //     newViews = views.splice(0, index - count + 1);
  //     isPop = true;
  //     this.setState({ views: newViews }, this.onRouteChange);
  //   } else if (index > 0) {
  //     isPop = true;
  //     newViews = views.splice(0, index);
  //     this.setState({ views: newViews }, this.onRouteChange);
  //   }
  //   return isPop;
  // };
  pop = (count = 1, index = 0) => {
    const { views } = this.state;
    let isPop = false;
    let newViews = [];
    const viewsLength = views.length;
    if (viewsLength > 1) {
      isPop = true;
      if (viewsLength - count > 0) {
        newViews = views.splice(0, viewsLength - count);
        this.setState({ views: newViews }, this.onRouteChange);
      }
    }
    return isPop;
  };

  getNavigation = ({ index }) => {
    let navigation = {};

    const getParams = (key) => {
      const { views } = this.state;
      const currentView = views?.[index];
      const params = key ? currentView?.params?.[key] : currentView?.params;
      return params;
    };

    const getRouteName = () => {
      return this.state?.views?.[index]?.view;
    };

    const getRouteIndex = () => {
      return index;
    };

    const getScreenState = () => {
      console.log("@@@@@@@@@get");
      let { views } = this.state;
      return views?.[index]?.screenState;
    };

    const setScreenState = (state, callback) => {
      console.log("@@@@@@@@@set");
      this.getScreenStateSetter({ index })(state, callback);
    };

    navigation.getScreenState = getScreenState;
    navigation.setScreenState = setScreenState;
    navigation.getParams = getParams;
    navigation.getRouteName = getRouteName;
    navigation.getRouteIndex = getRouteIndex;
    navigation.push = (route) => {
      console.log("@@@!@#@!#>>>>index", route, index);
      this.push(route, index);
    };
    navigation.replace = (route) => {
      this.replace(route, index);
    };
    navigation.pop = (count) => {
      this.pop(count, index);
    };
    navigation.goBack = () => {
      this.pop(1, index);
    };
    navigation.getActiveMQ = () => {
      return this.state.activeMQ;
    };
    navigation.getCurrentViewIndex = () => {
      return index;
    };
    navigation.getLastViewIndex = () => {
      return this.state.views.length - 1;
    };
    return navigation;
  };

  getScreenStateSetter = ({ index }) => {
    return (state, callback) => {
      let { views } = this.state;
      let { screenState } = views[index];
      let newState = { ...screenState, ...state };
      views[index].screenState = newState;
      this.setState({ views }, callback);
    };
  };

  render() {
    const { views, activeMQ } = this.state;
    const { Container, ScreenComponent } = this.props;
    if (!views?.length) {
      return null;
    }
    let children = (
      <View style={{ flex: 1, flexDirection: "row" }}>
        {views.map((view, index) => {
          const { view: routeName, navigation } = view || {};
          const { expanded } = navigation.getScreenState();
          const viewStyle = getViewStyle({
            activeMQ,
            viewLength: views.length,
            expanded,
            index,
          });
          return (
            <View
              key={`stack-${this.stackUniqueName}${index}`}
              style={viewStyle}
            >
              <StackItem
                navigation={navigation}
                screen={this.routes[routeName].screen || ErrorScreen}
                ScreenComponent={ScreenComponent}
                index={index}
                activeMQ={activeMQ}
              />
            </View>
          );
        })}
      </View>
    );
    return <View style={{ flex: 1 }}>{children}</View>;
  }
}

const StackNavigator = (views, stackOptions) => {
  class StackNavigator extends React.Component {
    getLoaction = () => {
      let pathName = window.location.pathname;
      let paramString = window.location.search;
      if (paramString) {
        paramString = paramString.substring(1);
        paramString = decodeURI(paramString);
        paramString = JSON.parse(paramString);
      }
      console.log("@@@@@@@@@@pathname!!>>", paramString);
      pathName = pathName && pathName.split("/");
      if (pathName?.length === 2) {
        pathName = pathName[1];
      } else {
        pathName = null;
      }
      return pathName;
    };
    setLocation = (path, replace) => {
      let history = window.history;
      if (replace) {
        history.replaceState({}, "", path);
      } else {
        history.pushState({}, "", path);
      }
    };
    handleBack = () => {
      let pathName = this.getLoaction();
      console.log("@@pathname!!>>>>>", pathName);
      //   let tabIndex = this.screenKeys.findIndex((item) => item === pathName);
      //   tabIndex = tabIndex === -1 ? 0 : tabIndex;
      //   this.setState({ tabIndex });
    };
    onRouteChange = ({ view, params }, replace) => {
      if (Platform.OS === "web") {
        let path = `${view}`;
        if (params) {
          path = path + `?${encodeURI(JSON.stringify(params))}`;
        }
        this.setLocation(path);

        // if (views && views.length) {
        //   let view = views[0];
        //   const { navigationKey } = stackOptions || {};
        //   if (view) {
        //     const {
        //       routeName,
        //       navigation: { action },
        //     } = view;
        //     if (Platform.OS === "web" && navigationKey === "main") {
        //       setLocationView({ view: routeName, action });
        //     }
        //   }
        // }
      }
    };
    // renderHeader = (props) => {
    //   let { header, ...rest } = props;
    //   header = getRenderComponent(header, rest);
    //   if (!header) {
    //     return null;
    //   }
    //   if (React.isValidElement(header)) {
    //     return header;
    //   } else {
    //     const { modal, ...restHeaderProps } = rest;
    //     return (
    //       <ToolBar
    //         {...(modal
    //           ? (isMobile && stackModalHeaderMobileTheme) ||
    //             stackModalHeaderTheme
    //           : (isMobile && stackHeaderMobileTheme) || stackHeaderTheme)}
    //         {...restHeaderProps}
    //         {...header}
    //       />
    //     );
    //   }
    // };
    // renderFooter = (props) => {
    //   let { footer, ...rest } = props;
    //   footer = getRenderComponent(footer, rest);
    //   if (!footer) {
    //     return null;
    //   }
    //   if (React.isValidElement(footer)) {
    //     return footer;
    //   } else {
    //     const { modal, ...restFooterProps } = rest;
    //     return (
    //       <ToolBar
    //         {...(modal ? stackModalFooterTheme : stackFooterTheme)}
    //         {...restFooterProps}
    //         {...footer}
    //       />
    //     );
    //   }
    // };

    render() {
      return (
        <Stack
          //   getActiveMQ={getActiveMQ}
          //   getResolvedMQProps={getResolvedMQProps}
          //   {...theme}
          {...stackOptions}
          {...this.props}
          routes={views}
          onRouteChange={this.onRouteChange}
          handleBack={this.handleBack}
          //   renderHeader={this.renderHeader}
          //   renderFooter={this.renderFooter}
          //   showBackPressMessage={showBackPressMessage}
        />
      );
    }
  }
  return StackNavigator;
};

export { StackNavigator, Stack };
