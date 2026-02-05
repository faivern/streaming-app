using backend.Models;
using backend.Models.Dtos;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/list")]
    [Authorize]
    public class ListController : ControllerBase
    {
        private readonly ListService _listService;

        public ListController(ListService listService)
        {
            _listService = listService;
        }

        private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)!.Value;

        [HttpGet]
        public async Task<IActionResult> GetUserLists()
        {
            try
            {
                var lists = await _listService.GetUserListsAsync(GetUserId());
                return Ok(lists);
            }
            catch (Exception)
            {
                return StatusCode(500);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var list = await _listService.GetByIdAsync(id, GetUserId());
                if (list is null) return NotFound();
                return Ok(list);
            }
            catch (Exception)
            {
                return StatusCode(500);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateListRequest request)
        {
            var (valid, error) = ListService.ValidateListName(request.Name);
            if (!valid) return BadRequest(error);

            try
            {
                var list = new Models.List
                {
                    UserId = GetUserId(),
                    Name = request.Name,
                    Description = request.Description,
                    IsPublic = request.IsPublic
                };

                var created = await _listService.CreateAsync(list);
                return Ok(created);
            }
            catch (Exception)
            {
                return StatusCode(500);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateListRequest request)
        {
            try
            {
                var list = await _listService.GetByIdAsync(id, GetUserId());
                if (list is null) return NotFound();

                if (request.Name is not null)
                {
                    var (valid, error) = ListService.ValidateListName(request.Name);
                    if (!valid) return BadRequest(error);
                    list.Name = request.Name;
                }

                if (request.Description is not null) list.Description = request.Description;
                if (request.IsPublic.HasValue) list.IsPublic = request.IsPublic.Value;

                var updated = await _listService.UpdateAsync(list);
                return Ok(updated);
            }
            catch (Exception)
            {
                return StatusCode(500);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deleted = await _listService.DeleteAsync(id, GetUserId());
                if (!deleted) return NotFound();
                return NoContent();
            }
            catch (Exception)
            {
                return StatusCode(500);
            }
        }

        [HttpPost("{id}/items")]
        public async Task<IActionResult> AddItem(int id, [FromBody] AddListItemRequest request)
        {
            if(request.MediaType != "movie" && request.MediaType != "tv")
            {
                return BadRequest("MediaType must be either 'movie' or 'tv'.");
            }

            try
            {
                var list = await _listService.GetByIdAsync(id, GetUserId());
                if (list is null) return NotFound();

                var item = new ListItem
                {
                    MediaType = request.MediaType,
                    TmdbId = request.TmdbId,
                    Title = request.Title,
                    PosterPath = request.PosterPath
                };

                list.Items.Add(item);
                await _listService.UpdateAsync(list);
                return Ok(list);
            }
            catch (Exception)
            {
                return StatusCode(500);
            }
        }




        [HttpDelete("{id}/items/{itemId}")]
        public async Task<IActionResult> RemoveItem(int id, int itemId)
        {
            try
            {
                var list = await _listService.GetByIdAsync(id, GetUserId());
                if (list is null) return NotFound();

                var item = list.Items.FirstOrDefault(i => i.Id == itemId);
                if (item is null) return NotFound();

                list.Items.Remove(item);
                await _listService.UpdateAsync(list);
                return NoContent();
            }
            catch (Exception)
            {
                return StatusCode(500);
            }
        }
    }
}
