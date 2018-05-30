import React, { Component } from "react";
import UpIcon from "@material-ui/icons/ArrowDropUp";
import DownIcon from "@material-ui/icons/ArrowDropDown";
import moment from "moment";
import numeral from "numeral";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

class Main extends Component {
  constructor(props) {
    super(props);
    this.goToUrl = this.goToUrl.bind(this);
    this.state = {
      data: [],
      sortBy: "mtime",
      sortByApp: "",
      sortOrder: "DESC",
      searchPhrase: "",
      config: [],
      anchorEl: null,
      value: false
    };
  }

  componentDidMount() {
    fetch("config/config.json")
      .then(res => res.json())
      .then(result => {
        this.setState({
          config: result
        });
        return result;
      })
      .then(config => {
        return Promise.all(
          config.map((row, index) =>
            fetch(row.url + row.jsonFile)
              .then(r => r.json())
              .then(result => {
                const newResult = result.map(r => {
                  r.appName = config[index].name;
                  return r;
                });
                return newResult;
              })
          )
        );
      })
      .then(allData => {
        this.setState({
          data: allData.reduce((result, row) => {
            return [...result, ...row];
          }, [])

          // result = []
          // for(row in allData) {

          //   result = [...result, ...row]
          //   result = new ArrayList().addAll(result).addAll(row)
          // }
        });
      });
  }

  changeSorting(sortKey) {
    const newState = {
      sortOrder: "DESC",
      sortBy: sortKey
    };

    if (this.state.sortOrder === "DESC") {
      newState.sortOrder = "ASC";
    }
    this.setState(newState);
  }

  filterByApp(appName) {
    const newState = {
      sortByApp: appName
    };
    this.setState(newState);
  }

  sortByName(a, b) {
    return b.name.localeCompare(a.name);
  }

  sortByDate(a, b) {
    return moment(a.mtime)
      .format("YYYY-MM-DD HH:mm ")
      .localeCompare(moment(b.mtime).format("YYYY-MM-DD HH:mm "));
  }

  handleSearch(e) {
    this.setState({ searchPhrase: e.target.value });
  }

  goToUrl(name, appName) {
    this.state.config.find(a => {
      return this.state.sortBy === appName ? null : window.open(a.url + name);
    });
  }

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  resetValue() {
    this.setState({ value: false });
  }

  render() {
    //this.state.config.map(ost => console.log(ost.name));
    //console.log("ost", this.state.config);
    const {} = this.state;
    const { anchorEl } = this.state;

    var serchData = this.state.data.filter(datan => {
      return (
        datan.name
          .toUpperCase()
          .indexOf(this.state.searchPhrase.toUpperCase()) > -1
      );
    });

    var newData = serchData;

    if (this.state.sortBy === "name") {
      newData.sort(this.sortByName);
    } else if (this.state.sortBy === "mtime") {
      newData.sort(this.sortByDate);
    }
    if (this.state.sortByApp === "All") {
      this.state.value = false;
    } else if (this.state.sortByApp) {
      newData = newData.filter(item => item.appName === this.state.sortByApp);
    }

    let sortIcon = null;
    if (this.state.sortOrder === "DESC") {
      newData.reverse();
      sortIcon = <DownIcon className="icon" />;
    } else sortIcon = <UpIcon className="icon" />;

    return (
      <div>
        <AppBar position="static" color="default">
          <Toolbar style={{ minHeight: 0 }}>
            <IconButton
              color="inherit"
              aria-label="Menu"
              onClick={this.handleClick}
            >
              <MenuIcon className="meny" />
            </IconButton>
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={this.handleClose}
            >
              <MenuItem
                onMouseUp={this.handleClose}
                onClick={e => this.changeSorting("name")}
              >
                Sort By Name
                {this.state.sortBy === "name" ? sortIcon : null}
              </MenuItem>
              <MenuItem
                onMouseUp={this.handleClose}
                onClick={e => this.changeSorting("mtime")}
              >
                Sort By Date
                {this.state.sortBy === "mtime" ? sortIcon : null}
              </MenuItem>
              <MenuItem
                onMouseUp={this.handleClose}
                onClick={e => this.filterByApp("All")}
              >
                Reset Filter
              </MenuItem>
            </Menu>
            <Tabs
              value={this.state.value}
              onChange={this.handleChange}
              indicatorColor="primary"
              textColor="primary"
            >
              {this.state.config.map(app => {
                return (
                  <Tab
                    key={app.name}
                    label={app.name}
                    onClick={e => this.filterByApp(app.name)}
                  />
                );
              })}
            </Tabs>
          </Toolbar>
        </AppBar>
        <div className="search-bar">
          <FormControl fullWidth>
            <TextField
              label="Search"
              id="margin-none"
              className="serchFeild"
              onChange={e => this.handleSearch(e)}
            />
          </FormControl>
        </div>

        <List component="nav">
          {newData.map((json, index) => {
            return (
              <ListItem
                button
                key={json.name + json.appName}
                onClick={e => this.goToUrl(json.name, json.appName)}
              >
                <ListItemText
                  primary={json.name}
                  secondary={
                    <span>
                      {moment(json.mtime).format("YYYY-MM-DD HH:mm ")}
                      &nbsp; &nbsp;
                      {numeral(json.size).format("0.00b")}
                      &nbsp; &nbsp;
                      {json.appName}
                    </span>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      </div>
    );
  }
}
export default Main;
