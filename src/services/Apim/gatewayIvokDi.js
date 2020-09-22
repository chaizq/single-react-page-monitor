import request from '@/utils/Platform/request';
import { getSessionCache } from '@/utils/Platform/platformUtil';

export default  function getUserRole() {
  const diToken = getSessionCache('diToken');
  const transApiUrl = `/di/DataCatalog/dcat/acap/privilege/_get_data_privilege?diToken=${diToken}`;
  return request(transApiUrl, {
    method: 'POST',
  });
}


