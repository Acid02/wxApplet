import {http} from '../utils/acid.js';

export const getVideowm = async ({params={}}={})=>{
  let data = {
      ...{
          service:'Videowm',
      },
      ...params
  }
  return await http({url:'api/video/',parmas:data})
}