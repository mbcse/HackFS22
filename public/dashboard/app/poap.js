
import axios, { AxiosRequestConfig } from 'axios'
import Log, { LogUtils } from '../../utils/Log'
import ValidationError from '../../errors/ValidationError'

export type AuthToken = {
  accessToken: string,
  scope: string,
  expiresIn: number,
  tokenType: string
}

export const PoapAPI = {
  URL: `https://${process.env.POAP_DOMAIN}/oauth/token`,

  generateToken: async () => {
    Log.debug('generating POAP auth token')

    const postData = {
      audience: process.env.POAP_AUDIENCE,
      grant_type: 'client_credentials',
      client_id: process.env.POAP_CLIENT_ID,
      client_secret: process.env.POAP_CLIENT_SECRET
    }

    const config = {
      method: 'post',
      url: PoapAPI.URL,
      headers: {
        'Content-Type': 'application/json'
      }
    }
    try {
      Log.debug('attempting to request poap auth token')
      const response = await axios.post(PoapAPI.URL, postData, config)
      Log.debug('poap auth token response', {
        indexMeta: true,
        meta: {
          data: response.data
        }
      })
      return {
        accessToken: response.data.access_token,
        scope: response.data.scope,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type
      }
    } catch (e) {
      LogUtils.logError('failed to request poap auth token', e)
      Log.warn('poap response', {
        indexMeta: true,
        meta: {
          error: e.toJSON
        }
      })
      if (e.response?.status == '400') {
        throw new ValidationError(`${e.response?.data?.message}`)
      }
      throw new Error('poap auth request failed')
    }
  }
}




import { EventsRequestType } from '../types/poap-events/EventsRequestType';
import { EventsResponseType } from '../types/poap-events/EventsResponseType';
import FormData from 'form-data';
import axios, { AxiosRequestConfig } from 'axios';
import Log, { LogUtils } from '../../utils/Log';
import ValidationError from '../../errors/ValidationError';
import PoapAPI, { AuthToken } from './PoapAPI';

const EventsAPI = {
	URL: 'https://api.poap.xyz/events',
	
	scheduleEvent: async (request) => {
		const authToken = await PoapAPI.generateToken();
		
		const formData = new FormData();
		formData.append('name', request.name);
		formData.append('description', request.description);
		formData.append('city', request.city);
		formData.append('country', request.country);
		formData.append('start_date', request.start_date);
		formData.append('end_date', request.end_date);
		formData.append('expiry_date', request.expiry_date);
		formData.append('year', request.year);
		formData.append('event_url', request.event_url);
		formData.append('virtual_event', request.virtual_event ? 'true' : 'false');
		formData.append('secret_code', request.secret_code);
		formData.append('event_template_id', request.event_template_id);
		formData.append('email', request.email);
		formData.append('requested_codes', request.requested_codes);
		

		formData.append('image', request.image.data, {
			contentType: 'image/png',
			filepath: request.image.config.url,
		});
		const config = {
			method: 'post',
			url: EventsAPI.URL,
			headers: {
				...formData.getHeaders(),
				'Authorization': `Bearer ${authToken.accessToken}`,
			},
			data : formData,
		};
		try {
			Log.info('sending poap formData request', {
				indexMeta: true,
				meta: {
					requestType: 'poap',
					name: `${request.name}`,
					description: `${request.description}`,
					city: `${request.city}`,
					country: `${request.country}`,
					start_date: `${request.start_date}`,
					end_date: `${request.end_date}`,
					expiry_date: `${request.expiry_date}`,
					year: request.year,
					event_url: `${request.event_url}`,
					virtual_event: `${request.virtual_event}`,
					secret_code: `${request.secret_code}`,
					event_template_id: `${request.event_template_id}`,
					email: `${request.email}`,
					requested_codes: `${request.requested_codes}`,
					imagePath: `${request.image.config.url}`,
				},
			});
			const response = await axios.post(EventsAPI.URL, formData, config);
			Log.info('poap schedule response', {
				indexMeta: true,
				meta: {
					data: response.data,
				},
			});
			return response.data;
		} catch (e) {
			LogUtils.logError('failed to send poap event to POAP BackOffice', e);
			if (e) {
				Log.warn('poap response', {
					indexMeta: true,
					meta: {
						error: e.toJSON,
						responseHeaders: e.response?.headers,
						responseStatus: e.response?.status,
						responseData: e.response?.data,
					},
				});
				if (e.response?.status == '400') {
					throw new ValidationError(`${e.response?.data?.message}`);
				}
			}
			throw new Error('poap event request failed');
		}
	},
};

export default EventsAPI;
