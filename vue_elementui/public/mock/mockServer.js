import Mock from 'mockjs'
import data from './mock.json'

Mock.mock('http://localhost:8080/wuliu', 'get', data)
