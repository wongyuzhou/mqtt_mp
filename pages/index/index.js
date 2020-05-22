//index.js
const mqtt = require('../../utils/mqtt');
const base64 = require('../../utils/base64');
import { host } from '../../config.js';

//获取应用实例
const app = getApp()

Page({

  data: {},
  onLoad: function () {
    this.initSocket();
  },

  //
  initSocket() {
    const options = {
      connectTimeout: 4000,
      clientId: 'esp32_led',
    };
    const client = mqtt.connect(`wx://${host}:8083/mqtt`, options);
    client.on('reconnect', (error) => {
      console.log('正在重连:', error)
    });
    client.on('error', (error) => {
      console.log('连接失败:', error);
    });
    client.on('connect', (e) => {
      console.log('成功连接MQTT');
      //订阅一个主题
      client.subscribe('esp32_led_status', {
        qos: 0
      }, function (err) {
        if (!err) {
          console.log("订阅成功");
        }
      });
      // 测试emqx api
      this.getClients();
    })
    //监听mq的返回
    client.on('message', function (topic, message, packet) {
      console.log("on receive", topic);
      console.log("on receive", packet.payload.toString());
      client.publish('esp32_led_commond', 'open');
      // client.end();
    })
  },

  // emqx api
  getClients() {
    let auth = base64.encode("admin:public"); // base auth
    wx.request({
      header: { 'Authorization': 'Basic ' + auth },
      url: `http://${host}:18083/api/v4/clients`,
      success: function (res) {
        console.info('-----', res);
      }
    })
  }
})